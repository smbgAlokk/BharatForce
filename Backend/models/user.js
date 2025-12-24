const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Company = require("./company");

const UserSchema = new mongoose.Schema(
  {
    // tenantId: {
    //   types: mongoose.Schema.Types.ObjectId,
    //   ref: "Company",
    // },
    name: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false, // Hide password by default
    },
    role: {
      type: String,
      enum: ["SUPER_ADMIN", "COMPANY_ADMIN", "MANAGER", "EMPLOYEE"],
      default: "COMPANY_ADMIN",
    },
    companyId: {
      type: String,
    },

    //  Reset Token Fields (Must be here)
    passwordResetToken: String,
    passwordResetExpires: Date,
  },
  { timestamps: true }
);

//  Pre-save hook: Hash the password before saving
UserSchema.pre("save", async function (next) {
  // Only run this function if password was actually modified
  if (!this.isModified("password")) return next();

  // Hash the password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

//  Method to check password (for Login)
UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

UserSchema.methods.createPasswordResetToken = function () {
  // 1. Generate a random 32-byte token (hex string)
  const resetToken = crypto.randomBytes(32).toString("hex");

  // 2. Encrypt (Hash) the token before saving to Database (Security Best Practice)
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // 3. Set Expiry to 10 minutes from now
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  // 4. Return the PLAIN text token (to send via email)
  return resetToken;
};

module.exports = mongoose.model("User", UserSchema);
