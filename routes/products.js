const { Category } = require('../models/category.js');
const { Product } = require('../models/product.js');
// const { RecentlyViewProduct } = require('../models/recentelyViewProduct.js');
const express = require('express');
const router = express.Router();
const multer  = require('multer')
const fs = require("fs");


var imagesArr=[];
var productEditId;
// var productId ;

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads")
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  })

const upload = multer({ storage: storage })

//upload route
router.post(`/upload`, upload.array("images"), async (req, res) => {
    let images;

    // Handle only for update case
    if (productEditId) {
        const product = await Product.findById(productEditId);

        if (product) {
            images = product.images || []; // Use product.images or default to an empty array
        }

        if (images && images.length !== 0) {
            for (const image of images) {
                const imagePath = `uploads/${image}`;
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath);
                } else {
                    console.log(`Image file not found: ${imagePath}`);
                }
            }
        }

        productEditId = ""; // Reset productEditId after handling
    }

    imagesArr = [];
    const files = req.files;

    for (let i = 0; i < files.length; i++) {
        imagesArr.push(files[i].filename);
    }

    
    res.send(imagesArr);
});



router.get(`/`, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default page to 1
        const perPage = parseInt(req.query.perPage) || 10; // Default perPage to 10 if not provided
        const totalPosts = await Product.countDocuments();
        const totalPages = Math.ceil(totalPosts / perPage);

        if (page > totalPages) {
            return res.status(404).json({ message: "Page not found" });
        }

        let productList=[];
        

         productList = await Product.find()
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();

        //this for product filter by category
        if(req.query.categoryId!==undefined){
            productList = await Product.find({categoryId:req.query.categoryId}).populate("category")
        }else{
            productList = await Product.find()
            .populate("category")
            .skip((page - 1) * perPage)
            .limit(perPage)
            .exec();
        }


        if (!productList) {
            return res.status(500).json({ success: false, message: "No products found" });
        }

        return res.status(200).json({
            products: productList,
            totalPages: totalPages,
            page: page,
        });

    } catch (error) {
        console.error(error); // Log the error for debugging purposes
        return res.status(500).json({ success: false, error: error.message });
    }
});



router.get(`/featured`, async (req, res) =>{
    const productList = await Product.find({isFeatured:true})
    if(!productList) {
        resizeBy.status(500).json({success: false});
    }
    return res.status(200).json(productList)
});

// router.get('/recentlyViewProduct', async (req, res) => {
//     try {
//       const productList = await RecentlyViewProduct.find(req.query).populate("category");
  
//       if (!productList.length) {
//         return res.status(404).json({ success: false, message: "No products found" });
//       }
  
//       return res.status(200).json(productList);
//     } catch (error) {
//       console.error("GET Error:", error);
//       return res.status(500).json({ success: false, error });
//     }
//   });

router.get('/:id', async(req, res) =>{
    productEditId = req.params.id;
    productId = req.params.id;
    const product = await Product.findById(req.params.id);

    if(!product) {
        res.status(500).json({ message: 'The product given Id is not found.'})
    }
    return res.status(200).send(product);
})

  
//   router.post('/recentlyViewProduct', async (req, res) => {
//     try {

//     let findProduct = await RecentlyViewProduct.find({productId:req.body.productId});
//     var product;
    
//     if(!findProduct.length==0){
//       //const imagesArr = req.body.images; // Ensure this is correctly sent in the request
//        product = new RecentlyViewProduct({
//         productId:req.body.id,
//         name: req.body.name,
//         description: req.body.description,
//         images:req.body.images,
//         brand: req.body.brand,
//         price: req.body.price,
//         catName: req.body.catName,
//         categoryId: req.body.categoryId,
//         category: req.body.category,
//         countInStock: req.body.countInStock,
//         ratings: req.body.ratings,
//         oldPrice: req.body.oldPrice,
//         discount: req.body.discount,
//         isFeatured: req.body.isFeatured,
//       });

//       const savedProduct = await product.save();

//       if(!savedProduct){
//         res.status(500).json({
//             error: err,
//             success: false
//         })
//       }
//       res.status(201).json(savedProduct);
//     }
//     } catch (error) {
//       console.error("POST Error:", error);
//       return res.status(500).json({ success: false, error });
//     }
  
      
//   });
  


//product create route


router.post('/create', async (req, res) =>{

    const category = await Category.findById(req.body.category);
    if(!category){
        return res.status(404).send("invalid category!");
    }

        let product = new Product({
            name: req.body.name,
            description: req.body.description,
            images: imagesArr,
            brand: req.body.brand,
            price:req.body.price,
            catName:req.body.catName,
            categoryId:req.body.categoryId,
            category:req.body.category,
            countInStock:req.body.countInStock,
            ratings:req.body.ratings,
            oldPrice:req.body.oldPrice,
            discount:req.body.discount,
            isFeatured: req.body.isFeatured,
            discount:req.body.discount    
        });

        product = await product.save();
        if(!product){
            res.status(500).json({
                error: err,
                success: false
            })
        }

    res.status(201).json(product)
});


router.delete('/:id', async (req, res) => {
    try {
        // Step 1: Find the product by ID
        const product = await Product.findById(req.params.id);
        if (!product) {
            // If the product is not found, return a 404 response
            return res.status(404).json({
                message: 'Product not found.',
                success: false
            });
        }

        // Step 2: Delete images associated with the product
        const images = product.images || [];
        if (images.length !== 0) {
            for (const image of images) {
                const imagePath = `uploads/${image}`;
                if (fs.existsSync(imagePath)) {
                    fs.unlinkSync(imagePath); // Delete image only if it exists
                } else {
                    console.log(`Image file not found: ${imagePath}`);
                }
            }
        }

        // Step 3: Delete the product from the database
        const deleteProduct = await Product.findByIdAndDelete(req.params.id);
        if (!deleteProduct) {
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
        
        return res.status(500).json({
            success: false,
            message: 'An error occurred while deleting the product.'
        });
    }
});


router.put('/:id', async(req, res) =>{
    productEditId = req.params.id; // Set the productEditId here
    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
        name: req.body.name,
        description: req.body.description,
        images: imagesArr,
        brand: req.body.brand,
        price:req.body.price,
        oldPrice:req.body.oldPrice,
        discount:req.body.discount,
        catName:req.body.catName,
        categoryId:req.body.categoryId,
        category:req.body.category,
        countInStock:req.body.countInStock,
        ratings:req.body.ratings,
        isFeatured: req.body.isFeatured,
        },
        {new:true}
    )

    if(!product) {
        return res.status(500).json({
            message: 'Product cannot be updated!',
            success: false
        })
    }

    res.status(200).json({
        message: 'the product is updated successfully!',
        success: true
    });
})


module.exports = router;