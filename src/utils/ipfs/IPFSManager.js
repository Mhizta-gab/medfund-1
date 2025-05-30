"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IPFSManager = void 0;
var PinataService_1 = require("./PinataService");
var IPFSManager = /** @class */ (function () {
    function IPFSManager() {
        this.database = null;
        this.databaseCID = null;
        this.pinataService = new PinataService_1.PinataService();
    }
    Object.defineProperty(IPFSManager.prototype, "pinata", {
        /**
         * Get instance of PinataService
         */
        get: function () {
            return this.pinataService;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(IPFSManager.prototype, "isConfigured", {
        /**
         * Check if service is configured properly
         */
        get: function () {
            return this.pinataService.configured;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Upload a new campaign with images
     */
    IPFSManager.prototype.uploadCampaign = function (campaignData) {
        return __awaiter(this, void 0, void 0, function () {
            var uploadedImageMap, _i, _a, image, imageHash, documents, _b, _c, key, docKey, campaignCID, error_1;
            var _d, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        if (!this.isConfigured) {
                            throw new Error('IPFS service not configured');
                        }
                        // Ensure campaign has an ID, and tracking fields are initialized
                        if (!campaignData.campaign.id) {
                            throw new Error('Campaign ID is required to upload.'); // Or generate one if preferred
                        }
                        campaignData.campaign.raisedAmount = (_d = campaignData.campaign.raisedAmount) !== null && _d !== void 0 ? _d : 0;
                        campaignData.campaign.donatorCount = (_e = campaignData.campaign.donatorCount) !== null && _e !== void 0 ? _e : 0;
                        campaignData.campaign.donationCount = (_f = campaignData.campaign.donationCount) !== null && _f !== void 0 ? _f : 0;
                        campaignData.campaign.updated = Date.now(); // Ensure updated timestamp is set
                        if (!campaignData.campaign.created) {
                            campaignData.campaign.created = Date.now(); // Set created if not present
                        }
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 8, , 9]);
                        uploadedImageMap = {};
                        _i = 0, _a = campaignData.images;
                        _g.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        image = _a[_i];
                        return [4 /*yield*/, this.pinataService.uploadBase64Image(image.base64, "".concat(image.key, ".").concat(image.mimeType.split('/')[1] || 'png'), image.mimeType)];
                    case 3:
                        imageHash = _g.sent();
                        uploadedImageMap[image.key] = imageHash;
                        _g.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5:
                        // Update campaign with image CIDs
                        if (uploadedImageMap['campaignImage']) {
                            campaignData.campaign.campaignImageCID = uploadedImageMap['campaignImage'];
                        }
                        if (uploadedImageMap['coverImage']) {
                            campaignData.campaign.coverImageCID = uploadedImageMap['coverImage'];
                        }
                        documents = campaignData.campaign.documentsCIDs || {};
                        for (_b = 0, _c = Object.keys(uploadedImageMap); _b < _c.length; _b++) {
                            key = _c[_b];
                            if (key.startsWith('document_')) {
                                docKey = key.replace('document_', '');
                                if (!documents.additionalFiles) {
                                    documents.additionalFiles = [];
                                }
                                documents.additionalFiles.push({
                                    name: docKey,
                                    cid: uploadedImageMap[key]
                                });
                            }
                        }
                        campaignData.campaign.documentsCIDs = documents;
                        return [4 /*yield*/, this.pinataService.uploadCampaignMetadata(campaignData.campaign)];
                    case 6:
                        campaignCID = _g.sent();
                        // Update the database if available
                        return [4 /*yield*/, this.updateDatabaseWithCampaign(campaignData.campaign)];
                    case 7:
                        // Update the database if available
                        _g.sent();
                        return [2 /*return*/, campaignCID];
                    case 8:
                        error_1 = _g.sent();
                        console.error('Failed to upload campaign to IPFS:', error_1);
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Upload a testimonial
     */
    IPFSManager.prototype.uploadTestimonial = function (testimonial, authorImageBase64) {
        return __awaiter(this, void 0, void 0, function () {
            var imageHash, testimonialCID, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConfigured) {
                            throw new Error('IPFS service not configured');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!authorImageBase64) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.pinataService.uploadBase64Image(authorImageBase64, "author_".concat(testimonial.authorName.replace(/\s+/g, '_'), ".png"), 'image/png')];
                    case 2:
                        imageHash = _a.sent();
                        testimonial.authorImageCID = imageHash;
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.pinataService.uploadTestimonial(testimonial)];
                    case 4:
                        testimonialCID = _a.sent();
                        // Update the database if available
                        return [4 /*yield*/, this.updateDatabaseWithTestimonial(testimonial)];
                    case 5:
                        // Update the database if available
                        _a.sent();
                        return [2 /*return*/, testimonialCID];
                    case 6:
                        error_2 = _a.sent();
                        console.error('Failed to upload testimonial to IPFS:', error_2);
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Upload a reward
     */
    IPFSManager.prototype.uploadReward = function (reward, rewardImageBase64) {
        return __awaiter(this, void 0, void 0, function () {
            var imageHash, rewardCID, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConfigured) {
                            throw new Error('IPFS service not configured');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        if (!rewardImageBase64) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.pinataService.uploadBase64Image(rewardImageBase64, "reward_".concat(reward.title.replace(/\s+/g, '_'), ".png"), 'image/png')];
                    case 2:
                        imageHash = _a.sent();
                        reward.imageCID = imageHash;
                        _a.label = 3;
                    case 3: return [4 /*yield*/, this.pinataService.uploadReward(reward)];
                    case 4:
                        rewardCID = _a.sent();
                        // Update the database if available
                        return [4 /*yield*/, this.updateDatabaseWithReward(reward)];
                    case 5:
                        // Update the database if available
                        _a.sent();
                        return [2 /*return*/, rewardCID];
                    case 6:
                        error_3 = _a.sent();
                        console.error('Failed to upload reward to IPFS:', error_3);
                        throw error_3;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Load campaign database from IPFS
     */
    IPFSManager.prototype.loadDatabase = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var database, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pinataService.getJSON(cid)];
                    case 1:
                        database = _a.sent();
                        this.database = database;
                        this.databaseCID = cid;
                        return [2 /*return*/, database];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Failed to load database from IPFS:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Create a new empty database
     */
    IPFSManager.prototype.createEmptyDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var emptyDatabase, cid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        emptyDatabase = {
                            campaigns: [],
                            testimonials: [],
                            rewards: []
                        };
                        return [4 /*yield*/, this.pinataService.uploadCampaignDatabase(emptyDatabase)];
                    case 1:
                        cid = _a.sent();
                        this.database = emptyDatabase;
                        this.databaseCID = cid;
                        return [2 /*return*/, cid];
                }
            });
        });
    };
    /**
     * Update the database with a new campaign
     */
    IPFSManager.prototype.updateDatabaseWithCampaign = function (campaign) {
        return __awaiter(this, void 0, void 0, function () {
            var existingIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.database) {
                            return [2 /*return*/];
                        }
                        existingIndex = this.database.campaigns.findIndex(function (c) { return c.id === campaign.id; });
                        if (existingIndex !== -1) {
                            this.database.campaigns[existingIndex] = campaign;
                        }
                        else {
                            this.database.campaigns.push(campaign);
                        }
                        return [4 /*yield*/, this.saveDatabase()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update the database with a new testimonial
     */
    IPFSManager.prototype.updateDatabaseWithTestimonial = function (testimonial) {
        return __awaiter(this, void 0, void 0, function () {
            var existingIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.database) {
                            return [2 /*return*/];
                        }
                        existingIndex = this.database.testimonials.findIndex(function (t) {
                            return t.authorName === testimonial.authorName && t.campaignId === testimonial.campaignId;
                        });
                        if (existingIndex !== -1) {
                            this.database.testimonials[existingIndex] = testimonial;
                        }
                        else {
                            this.database.testimonials.push(testimonial);
                        }
                        return [4 /*yield*/, this.saveDatabase()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update the database with a new reward
     */
    IPFSManager.prototype.updateDatabaseWithReward = function (reward) {
        return __awaiter(this, void 0, void 0, function () {
            var existingIndex;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.database) {
                            return [2 /*return*/];
                        }
                        existingIndex = this.database.rewards.findIndex(function (r) { return r.title === reward.title && r.campaignId === reward.campaignId; });
                        if (existingIndex !== -1) {
                            this.database.rewards[existingIndex] = reward;
                        }
                        else {
                            this.database.rewards.push(reward);
                        }
                        return [4 /*yield*/, this.saveDatabase()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Saves the current in-memory database to IPFS via Pinata.
     * Returns the new CID of the database.
     */
    IPFSManager.prototype.saveDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cid, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.database) {
                            throw new Error('Database not loaded or initialized.');
                        }
                        if (!this.isConfigured) {
                            throw new Error('IPFS service not configured');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.pinataService.uploadCampaignDatabase(this.database)];
                    case 2:
                        cid = _a.sent();
                        this.databaseCID = cid;
                        console.log("Database saved. New CID: ".concat(cid));
                        return [2 /*return*/, cid];
                    case 3:
                        error_5 = _a.sent();
                        console.error('Failed to save database to IPFS:', error_5);
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return IPFSManager;
}());
exports.IPFSManager = IPFSManager;
