const Blog = require('../models/blog')
const formidable = require('formidable')
const slugify = require('slugify')
const {stripHtml} = require('string-strip-html')
const _ = require('lodash')
const Category = require('../models/category')
const Tag = require('../models/tag')
const fs = require('fs')
const {smartTrim} = require('../helpers/blog')


 exports.create = (req, res) => {
      let form = new formidable.IncomingForm()
      form.keepExtensions = true
      form.parse(req, (err, fields, files) => {
         if(err) {
            return res.json(400).json({
               error: "Image could not upload"
            })
         }
         const {title, body, categories, tags} = fields;

         if(!title || !title.length) {
            return res.status(400).json({
               error: 'title is required'
            })
         }
         if(!body || body.length < 200) {
            return res.status(400).json({
               error: 'Content is too short'
            })
         }
         if(!categories || categories.length === 0) {
            return res.status(400).json({
               error: 'At least one category is required'
            })
         }
         if(!tags || tags.length === 0) {
            return res.status(400).json({
               error: 'At least one tag required'
            })
         }

         let blog = new Blog()
         blog.title = title
         blog.body = body
         blog.excerpt = smartTrim(body, 320, ' ', ' ...')
         blog.slug = slugify(title).toLowerCase()
         blog.mtitle = `${title}`
         blog.mdesc = stripHtml(body.substring(0, 160)).result
         blog.postedBy = req.user._id

         let arrayOfCategories = categories && categories.split(',')
         let arrayOfTags = tags && tags.split(',')


         if(files.photo) {
            if(files.photo.size > 10000000 ) {
               return res.status(400).json({
                  error:"Image should be less than 1MB"
               })
            }
            blog.photo.data = fs.readFileSync(files.photo.path)
            blog.photo.contentType = files.photo.type
         }

         blog.save((err, result) => {
            if(err) {
               return res.status(400).json({
                  error: err
               })
            }
            Blog.findByIdAndUpdate(result._id, {$push: {categories: arrayOfCategories}}, {new: true}).exec((err, result) => {
               if(err) {
                  return res.status(400).json({
                     error: err
                  })
               } else {
                  Blog.findByIdAndUpdate(result._id, {$push: {tags: arrayOfTags}}, {new: true}).exec((err, result) => {
                     if(err) {
                        return res.status(400).json({
                           error: err
                        })
                     } else {
                        res.json(result)
                     }
                  })
               }
            })
         })
      })
}



exports.list = (req, res) => {
   Blog.find({})
   .populate('categories', '_id name slug')
   .populate('tag', '_id name slug')
   .populate('postedBy', '_id name username')
   .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
   .exec((err, data) => {
      if(err) {
         return res.json({
            error: err
         })
      }
      res.json(data)
   })
}

exports.listAllBlogsCategoriesTags = (req, res) => {
   let limit = req.body.limit ? parseInt(req.body.limit) : 10;
   let skip = req.body.skip ? parseInt(req.body.skip) : 0

   let blogs = ''
   let categories = ''
   let tags = ''

   Blog.find({})
   .populate('categories', '_id name slug')
   .populate('tag', '_id name slug')
   .populate('postedBy', '_id name username')
   .sort({createdAt: -1})
   .skip(skip)
   .limit(limit)
   .select('_id title slug excerpt categories tags postedBy createdAt updatedAt')
   .exec((err, data) => {
      if(err) {
         return res.json({
            error: err
         })
      }
      blogs = data //blogs
      //get all categories
      Category.find({}).exec((err, ctg) => {
         if(err) {
            return res.json({
               error: err
            })
         }
         categories = ctg
         Tag.find({}).exec((err, tg) => {
            if(err) {
               return res.json({
                  error: err
               })
            }
            tags = tg

            res.json({blogs, categories, tags, size: blogs.length})
         })
      })
   })
}

exports.read = (req, res) => {
   const slug = req.params.slug.toLowerCase();
   Blog.findOne({slug})
   .populate('categories', '_id name slug')
   .populate('tag', '_id name slug')
   .populate('postedBy', '_id name username')
   .select('_id title slug excerpt categories tags postedBy createdAt body updatedAt')
   .exec((err, data) => {
      if(err) {
         return res.status(400).json({
            error: err
         })
      } 
          res.json(data)
      
       
   })
}

exports.remove = (req,res) => {
   const slug = req.params.slug.toLowerCase()
   Blog.findOneAndRemove({slug}).exec((err, data) => {
      if(err) {
         return res.status(400).json({
            error: err
         })
      }
      res.json({
         message:'Blog deleted succesfully'
      })
   })
}
exports.update = (req, res) => {

}

exports.photo = (req, res) => {

   const slug = req.params.slug.toLowerCase();
   Blog.findOne({slug})
   .select('photo')
   .exec((err, data) => {
      if(err || !data) {
         return res.status(400).json({
            error: err
         })
      }
      res.set('Content-Type', data.photo.contentType)
      return res.send(data.photo.data)

   })
}

exports.listRelated = (req, res) => {
   let limit = req.body.limit ? parseInt(req.body.limit) : 3;
   const {_id, categories} = req.body.blog;

   Blog.find({_id: {$ne: _id}, categories:{$in: categories}})
   .limit(limit)
   .populate('postedBy', '_id name profile')
   .select('title slug excerpt postedBy createdAt updatedAt')
   .exec((err, data) => {
      if(err) {
         return res.status(400).json({
            error:'Blogs not found'
         })
      }
      res.json(data)
   })



}



exports.listSearch = (req, res) => {
   const { search } = req.query

   if(search) {
      Blog.find({
         $or: [{title: { $regex: search, $options: 'i'}}, { body: { $regex: search, $options: 'i'}}]
      }, (err, blogs) => {
         if(err) {
            return res.status(400).json({
               error: err
            })
         }
         res.json(blogs)
      })
   }
}