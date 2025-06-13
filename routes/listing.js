const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js");
const listingController = require("../controllers/listings.js");
const multer = require("multer")
const {storage} = require("../cloudConfig.js")
const upload = multer({storage})

// Index and Create
router
  .route("/")
  .get(wrapAsync(listingController.index)) // GET all listings
  .post(
    isLoggedIn,
    upload.single('listing[image][url]'),
    validateListing,
    wrapAsync(listingController.createListing)
  ) // POST new listing

  router.get("/", listingController.index);

// New Form
router.get("/new", isLoggedIn, listingController.renderNewForm);

// Show, Update, Delete
router
  .route("/:id")
  .get(wrapAsync(listingController.showListing)) // GET one listing
  .put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image][url]'),
    validateListing,
    wrapAsync(listingController.updateListing)
  ) // PUT update listing
  .delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.destroyListing)
  ); // DELETE listing

// Edit Form
router.get(
  "/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.renderEditForm)
);

module.exports = router;
