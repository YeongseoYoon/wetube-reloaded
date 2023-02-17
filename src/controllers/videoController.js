import Video from "../models/Video";
import User from "../models/User";

const HTTP_BAD_REQUEST = 400;
const HTTP_NOT_FOUND = 404;
const HTTP_FORBIDDEN = 403;

export const home = async(req,res)=> {
  const videos = await Video.find({})
  .sort({ createdAt: "desc" })
  .populate("owner");
    return res.render("home",{pageTitle : "Home", videos});
};
export const watch = async(req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id).populate("owner");
  console.log(video);
  if(!video){
    return res.status(HTTP_NOT_FOUND).render("404", { pageTitle: "Video Not Found"});
  }
  return res.render("watch", { pageTitle: video.title, video});

};
export const getEdit = async(req, res) => {
  const { id } = req.params;
  const {user : {_id}} = req.session;
  const video = await Video.findById(id);
  if(!video){
    return res.status(HTTP_NOT_FOUND).render("404", { pageTitle: "Video Not Found"});
  }
  if(String(video.owner) !== String(_id)){
    return res.status(HTTP_FORBIDDEN).redirect("/");
  }
  return res.render("edit", { pageTitle: `Edit ${video.title}`,video});
};
export const postEdit = async(req, res) => {
  const { id } = req.params;
  const {user : {_id}} = req.session;
  const {title, description, hashtags} = req.body;
  //exists() takes only a 'filter'. And also it just return a boolean type of value
  //So you can puts argument into exists() to make a conditional sentence
  const video = await Video.exists({_id:id});
  if(!video){
    return res.status(HTTP_NOT_FOUND).render("404", { pageTitle: "Video Not Found"});
  }
  if(String(video.owner) !== String(_id)){
    return res.status(HTTP_FORBIDDEN).redirect("/");
  }
  await Video.findByIdAndUpdate(id, {
    title, 
    description, 
    hashtags:Video.formatHashtags(hashtags),
  })
  return res.redirect(`/videos/${id}`);
};

export const getUpload = (req, res) => {
  return res.render("upload", { pageTitle: "Upload Video" });
};

export const postUpload = async (req, res) => {
  const {user : {_id},} = req.session;
  const {path:fileUrl} = req.file;
  const { title, description, hashtags} = req.body;
  try{
    const newVideo = await Video.create({
      title,
      description,
      fileUrl,
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
  }catch(error){
    return res.status(HTTP_BAD_REQUEST).render("upload", { 
      pageTitle: "Upload Video",
      errorMessage: error._message,
   });
  }

};

export const deleteVideo = async(req, res) =>{
  const {id} = req.params;
  const {user : {_id}} = req.session;
  const video = await Video.findById(id);
  if(!video){
    return res.status(HTTP_NOT_FOUND).render("404", { pageTitle: "Video Not Found"});
  }
  if(String(video.owner) !== String(_id)){
    return res.status(HTTP_FORBIDDEN).redirect("/");
  }
  //What is diff between findByIdAnd'Delete' and findByIdAnd'Remove'?
  //A doc says you should use findByIdAndDelete but i dnt knw the reason
  await Video.findByIdAndDelete(id);
  return res.redirect("/");
};

export const search = async(req, res) =>{
  const {keyword} = req.query;
  let videos = [];
  if(keyword){
    videos = await Video.find({
      title:{
        $regex: new RegExp(keyword,"i")
      },
    }).populate("owner");
  }
  return res.render("search",{pageTitle : "Search",videos});
}