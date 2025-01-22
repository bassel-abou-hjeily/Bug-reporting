const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['Developer', 'Tester', 'Manager', 'Admin'],
        default: 'Tester',
    },
    bugsAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bug' }],
    bugsReported: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Bug' }],
}, {
    timestamps: true,
});
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
