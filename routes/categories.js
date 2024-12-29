const { Category } = require('../models/category');
const express = require('express');
const router = express.Router();
const multer  = require('multer')
const fs = require("fs");
const { error } = require('console');


var imagesArr=[];

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads")
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  })

const upload = multer({ storage: storage })




router.get(`/`, async(req, res) =>{
    try{
        const page = parseInt(req.query.page) || 1;
        const perPage = 15;
        const totalPosts = await Category.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return res.status(404).json({ message: "Page not found"})
        }


        const categoryList = await Category.find()
            .skip((page-1) * perPage)
            .limit(perPage)
            .exec();

        if(!categoryList){
            res.status(500).json({ success: false})
        }
    
        
        return res.status(200).json({
                "categoryList":categoryList,
                "totalPages":totalPages,
                "page":page
        })



    }catch(error){
        res.status(500).json({ success: false})
    }
    });
    
    
    

router.get('/:id', async(req, res) =>{
    const category = await Category.findById(req.params.id);

    if(!category) {
        res.status(500).json({ message: 'The category given Id is not found.'})
    }
    return res.status(200).send(category);
})

//upload route

// router.post(`/upload`, upload.array('images'), async(req, res) => {
//     try {
//         console.log(req.files); // Logs the uploaded files

//         const imagesArr = [];
//         const files = req.files;

//         for (let i = 0; i < files.length; i++) {
//             imagesArr.push(files[i].filename);
//         }

//         // Send a single response with the image filenames
//         return res.status(200).json({ message: 'Files uploaded successfully', images: imagesArr });
//     } catch (error) {
//         console.error('Error uploading files:', error);
//         return res.status(500).json({ message: 'Error uploading files' });
//     }
// });


router.post('/create', async (req, res) => {
    
   
     let  category = new Category({
            name: req.body.name,
            // images: imagesArr,
            // color: req.body.color,
        });

        if(!category){
            res.status(505).json({
                error: err,
                success: false
            })
        }

        category = await category.save()


            res.status(201).json(category)
        });

router.delete('/:id', async(req, res) =>{
        try {
            // Step 1: Find the product by ID
            const category = await Category.findById(req.params.id);
            if (!category) {
                // If the product is not found, return a 404 response
                return res.status(404).json({
                    message: 'Product not found.',
                    success: false
                });
            }
    
            // Step 2: Delete images associated with the product
            // const images = category.images || [];
            // if (images.length !== 0) {
            //     for (const image of images) {
            //         const imagePath = `uploads/${image}`;
            //         if (fs.existsSync(imagePath)) {
            //             fs.unlinkSync(imagePath); // Delete image only if it exists
            //         } else {
            //             console.log(`Image file not found: ${imagePath}`);
            //         }
            //     }
            // }
    
            // Step 3: Delete the product from the database
            const deleteCategory = await Category.findByIdAndDelete(req.params.id);
            if (!deleteCategory) {
                // If the product could not be deleted, send an error response
                return res.status(400).json({
                    message: 'The Product could not be deleted.',
                    success: false
                });
            }
    
            // Step 4: Send a success response
            return res.status(200).json({
                success: true,
                message: 'The Product is Deleted!'
            });
        } catch (error) {
            // Catch and log any errors
            console.error('Error deleting product:', error);
            return res.status(500).json({
                success: false,
                message: 'An error occurred while deleting the product.'
            });
        }
    });


router.put('/:id', async(req, res) =>{


        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                // images: imgurl,
                // color: req.body.color,
            },
            {new:true}
        )

        if(!category) {
            return res.status(500).json({
                message: 'Category cannot be updated!',
                success: false
            })
        }

        res.send(category);
})



module.exports = router;