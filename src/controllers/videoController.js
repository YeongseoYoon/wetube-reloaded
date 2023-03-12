import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_FORBIDDEN = 403;

export const home = async (req, res) => {
  const videos = await Video.find({})
    .sort({ createdAt: "desc" })
    .populate("owner");
  return res.render("home", { pageTitle: "Home", videos });
};
export const watch = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id)
    .populate("owner")
    .populate({
      path: "comments",
      populate: {
        path: "owner",
        model: "User",
      },
    });

  if (!video) {
    return res
      .status(HTTP_NOT_FOUND)
      .render("404", { pageTitle: "Video Not Found" });
  }
  return res.render("watch", { pageTitle: video.title, video });
};
export const getEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(HTTP_NOT_FOUND)
      .render("404", { pageTitle: "Video Not Found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "Not authorized");
    return res.status(HTTP_FORBIDDEN).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`, video });
};
export const postEdit = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const { title, description, hashtags } = req.body;

  //exists() takes only a 'filter'. And also it just return a boolean type of value
  //So you can puts argument into exists() to make a conditional sentence
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(HTTP_NOT_FOUND)
      .render("404", { pageTitle: "Video Not Found" });
  }
  if (String(video.owner) !== String(_id)) {
    req.flash("error", "You are not the the owner of the video.");
    return res.status(HTTP_FORBIDDEN).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title,
    description,
    hashtags: Video.formatHashtags(hashtags),
  });
  req.flash("success", "Changes saved.");
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {
    user: { _id },
  } = req.session;
  const { video, thumb } = req.files;
  const { title, description, hashtags } = req.body;
  const isKoyeb = process.env.NODE_ENV === "production";
  try {
    const newVideo = await Video.create({
      title,
      description,
      fileUrl: isKoyeb ? video[0].location : video[0].path,
      thumbUrl: isKoyeb ? thumb[0].location : thumb[0].path,
      owner: _id,
      hashtags: Video.formatHashtags(hashtags),
    });
    const user = await User.findById(_id);
    user.videos.push(newVideo._id);
    user.save();
    //save() returns a promise -> it means it just wait for the work 'save'
    //await video.save();
    //it takes some times to save data to database, so it has to wait
    return res.redirect("/");
  } catch (error) {
    return res.status(HTTP_BAD_REQUEST).render("upload", {
      pageTitle: "Upload Video",
      errorMessage: error._message,
    });
  }
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const {
    user: { _id },
  } = req.session;
  const video = await Video.findById(id);
  if (!video) {
    return res
      .status(HTTP_NOT_FOUND)
      .render("404", { pageTitle: "Video Not Found" });
  }
  if (String(video.owner) !== String(_id)) {
    return res.status(HTTP_FORBIDDEN).redirect("/");
  }
  //What is diff between findByIdAnd'Delete' and findByIdAnd'Remove'?
  //A doc says you should use findByIdAndDelete but i dnt knw the reason
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async (req, res) => {
  const { keyword, searchCategory } = req.query;
  let videos = [];
  console.log(searchCategory);
  if (searchCategory === "title") {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, "i"),
      },
    }).populate("owner");
  } else if (searchCategory === "hashtag") {
    videos = await Video.find({
      hashtags: { $regex: new RegExp(keyword, "i") },
    }).populate("owner");
  } else if (searchCategory === "uploader") {
    videos = await Video.find({
      owner: {
        $regex: new RegExp(keyword, "i"),
      },
    })
      .populate("owner")
      .populate({
        path: "owner",
        populate: {
          path: "videos",
          model: "User",
        },
      });
  }
  console.log(videos);
  return res.render("search", { pageTitle: "Search", videos });
};

export const registerView = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) {
    return res.sendStatus(404);
  }
  video.meta.views = video.meta.views + 1;
  await video.save();
  return res.sendStatus(200);
};

export const createComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { id },
  } = req;
  if (text === "") {
    return res.sendStatus(HTTP_BAD_REQUEST);
  }
  const video = await Video.findById(id);
  if (!video) {
    //use sendStatus to kill the request
    return res.sendStatus(HTTP_NOT_FOUND);
  }
  const comment = await Comment.create({
    text,
    owner: user._id,
    video: id,
  });
  video.comments.push(comment._id);
  video.save();
  return res.status(201).json({ newCommentId: comment._id, owner: user.name });
};

export const deleteComment = async (req, res) => {
  const {
    session: {
      user: { _id },
    },
    params: { commentId },
  } = req;
  const comment = await Comment.findById(commentId).populate("owner");
  const videoId = comment.video;
  if (String(_id) != String(comment.owner._id)) {
    return res.sendStatus(HTTP_NOT_FOUND);
  }

  const video = await Video.findById(videoId);
  if (!video) {
    return res.sendStatus(HTTP_NOT_FOUND);
  }

  video.comments.splice(video.comments.indexOf(commentId), 1);
  await Comment.findByIdAndDelete(commentId);
  video.save();
  return res.sendStatus(201);
};

export const updateComment = async (req, res) => {
  const {
    session: { user },
    body: { text },
    params: { commentId },
  } = req;
  if (text === "") {
    return res.sendStatus(HTTP_BAD_REQUEST);
  }
  const comment = await Comment.findById(commentId).populate("owner");
  if (user._id !== String(comment.owner._id)) {
    return res.sendStatus(HTTP_FORBIDDEN);
  }
  await Comment.findByIdAndUpdate(commentId, {
    text,
  });
  return res.sendStatus(201);
};
