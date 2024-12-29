const  mongoose  = require("mongoose");

const recentlyViewProductSchema = mongoose.Schema({

    productId:{
        type: String,
        
        default:''
    },
    name:{
        type: String,
        required: true
    },

    description: {
        type: String,
        required: true
    },
    images: { type: [String], default: [] },

    brand: {
        type: String,
        required: true
    },

   price:{
        type: Number,
        default: 0
    },
    oldPrice:{
        type: Number,
        default: 0
    },
    discount:{
        type: Number,
        default: 0
    },
    catName:{
        type: String,
        
        default:''
    },
    categoryId:{
        type: String,
        default:''
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },

    countInStock:{
        type: Number,
        required: true
    },

    ratings:{
        type: Number,
        default: 0
    },

    // reviews:{
    //     type: Number,
    //     default:0
    // },

    isFeatured: {
        type: Boolean,
        default: false
    },

    dateCreated:{
        type: Date,
        default: Date.now
    }

    
})
recentlyViewProductSchema.virtual('id').get(function (){
    return this._id.toHexString();
});

recentlyViewProductSchema.set('toJSON', {
    virtuals: true,
})

exports.RecentlyViewProduct = mongoose.model('RecentlyViewProduct', recentlyViewProductSchema);