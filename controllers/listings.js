const Listing = require("../models/listing");
const mapToken = process.env.MAP_TOKEN;
const axios = require('axios');

// module.exports.index = async (req, res) => {
//     const allListings = await Listing.find({});
//     res.render("listings/index.ejs", {allListings});
// }
module.exports.index = async (req, res) => {
  const query = req.query.q;
//   console.log("Search query:", query); 

  let allListings;
  if (query) {
    const regex = new RegExp(escapeRegex(query), 'i'); // case-insensitive search
    allListings = await Listing.find({
      $or: [
        { title: regex }
      ]
    });
  } else {
    allListings = await Listing.find({});
  }

  res.render("listings/index", { allListings, query });
};

// Helper function to sanitize regex input
function escapeRegex(string) {
  return string.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", {listing});
    // console.log(listing);
}

module.exports.createListing = async (req, res, next) => {
    const address = req.body.listing.location;
    const apiKey = mapToken;

    try {
        // ✅ Call OpenCage API
        const geoRes = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: {
                key: apiKey,
                q: address
            }
        });

        const geoData = geoRes.data;

        if (geoData.results.length > 0) {
            const { lat, lng } = geoData.results[0].geometry;

            const geoJSONPoint = {
                type: "Point",
                coordinates: [lng, lat] // GeoJSON requires [lng, lat]
            };

            let url = req.file.path;
            let filename = req.file.filename;
            const newListing = new Listing(req.body.listing);
            newListing.owner = req.user._id;
            newListing.image = { url, filename };
            newListing.geometry = geoJSONPoint;
            let savee = await newListing.save();
            console.log(savee)
            req.flash("success", "New Listing Created!");
            res.redirect("/listings");
        } else {
            req.flash("error", "Could not find location on map.");
            res.redirect("/listings/new");
        }

    } catch (err) {
        console.error("Geocoding Error:", err.message);
        req.flash("error", "Geocoding failed.");
        res.redirect("/listings/new");
    }
};


module.exports.renderEditForm = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    if(!listing) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
    res.render("listings/edit.ejs", { listing, originalImageUrl });
}

module.exports.updateListing = async (req, res) => {
    let {id} = req.params;
    let listing = await Listing.findByIdAndUpdate(id, {...req.body.listing});

    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }

    req.flash("success", "Listing Updated!");
    res.redirect(`/listings/${id}`);
}

module.exports.destroyListing = async (req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
}