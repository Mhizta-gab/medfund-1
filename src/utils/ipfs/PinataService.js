"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.PinataService = void 0;
// Load environment variables if available (for Node.js context like scripts)
// In a Next.js app, these would typically be prefixed with NEXT_PUBLIC_ if used client-side
// or accessed directly server-side / during build.
var PINATA_JWT = typeof process !== 'undefined' && process.env ? process.env.PINATA_JWT : undefined;
var PINATA_GATEWAY_URL = typeof process !== 'undefined' && process.env ? process.env.PINATA_GATEWAY_URL : undefined;
var PinataService = /** @class */ (function () {
    function PinataService() {
        // Use environment variable if available, otherwise fallback to hardcoded (not recommended for production scripts)
        this.jwt = PINATA_JWT || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI1NWQ2NzViMi0xMTE0LTQwM2YtYWY4My1kYWM3NGEwZDhiYWYiLCJlbWFpbCI6ImFidWJha3JqaW1vaDE2NDg4QGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIyYjA3YWZiZWQyZGUwODU5NjljYiIsInNjb3BlZEtleVNlY3JldCI6ImI5OTJhNmVmYTFhMGI3Yjk4N2FhYTk3ZjJmNzY3Zjk2ZDIwODJmMmM4YjY4MTA3ZWZiN2JkYzMzZWRmMjBjMGIiLCJleHAiOjE3Nzg0NDAzMDB9.Bzz6cn3CGva51durvGyrkCJGmlK_FoQ28EBp-tQ6lUk';
        this.gateway = PINATA_GATEWAY_URL || 'https://gateway.pinata.cloud/ipfs/';
        this.isConfigured = !!this.jwt && !this.jwt.startsWith('eyJhbGci'); // A simple check if it's not the placeholder
        if (PINATA_JWT && this.jwt === PINATA_JWT) {
            this.isConfigured = true; // Definitely configured if it came from ENV
        }
        else if (!PINATA_JWT && this.jwt.startsWith('eyJhbGci')) {
            console.warn("PinataService is using a hardcoded JWT. Please set PINATA_JWT environment variable for scripts.");
            // this.isConfigured will remain false or based on the placeholder check to encourage env var usage
        }
    }
    Object.defineProperty(PinataService.prototype, "configured", {
        get: function () {
            return this.isConfigured;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(PinataService.prototype, "gatewayUrl", {
        get: function () {
            return this.gateway;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Upload JSON content to IPFS via Pinata
     */
    PinataService.prototype.uploadJSON = function (content, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var requestBody, response, error, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConfigured) {
                            throw new Error('Pinata service not configured. Missing JWT token.');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        requestBody = {
                            pinataContent: content
                        };
                        if (metadata) {
                            requestBody.pinataMetadata = {
                                name: metadata.name || 'MedFund Data',
                                keyvalues: __assign({}, metadata)
                            };
                        }
                        return [4 /*yield*/, fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: "Bearer ".concat(this.jwt),
                                },
                                body: JSON.stringify(requestBody),
                            })];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        error = _a.sent();
                        throw new Error("Failed to upload JSON: ".concat(error));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _a.sent();
                        return [2 /*return*/, data.IpfsHash];
                    case 6:
                        error_1 = _a.sent();
                        console.error('Failed to upload JSON to Pinata:', error_1);
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Upload a file to IPFS via Pinata
     */
    PinataService.prototype.uploadFile = function (file, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var formData, response, error, data, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConfigured) {
                            throw new Error('Pinata service not configured. Missing JWT token.');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        formData = new FormData();
                        formData.append('file', file);
                        if (metadata) {
                            formData.append('pinataMetadata', JSON.stringify({
                                name: file.name,
                                keyvalues: metadata
                            }));
                        }
                        return [4 /*yield*/, fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                                method: 'POST',
                                headers: {
                                    Authorization: "Bearer ".concat(this.jwt),
                                },
                                body: formData,
                            })];
                    case 2:
                        response = _a.sent();
                        if (!!response.ok) return [3 /*break*/, 4];
                        return [4 /*yield*/, response.text()];
                    case 3:
                        error = _a.sent();
                        throw new Error("Failed to upload file: ".concat(error));
                    case 4: return [4 /*yield*/, response.json()];
                    case 5:
                        data = _a.sent();
                        return [2 /*return*/, data.IpfsHash];
                    case 6:
                        error_2 = _a.sent();
                        console.error('Failed to upload file to Pinata:', error_2);
                        throw error_2;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Upload a base64 image to IPFS
     */
    PinataService.prototype.uploadBase64Image = function (base64Data_1) {
        return __awaiter(this, arguments, void 0, function (base64Data, filename, mimeType, metadata) {
            var base64Content, byteCharacters, byteArrays, offset, slice, byteNumbers, i, byteArray, blob, file;
            if (filename === void 0) { filename = 'image.png'; }
            if (mimeType === void 0) { mimeType = 'image/png'; }
            return __generator(this, function (_a) {
                try {
                    base64Content = base64Data.includes('base64,')
                        ? base64Data.split('base64,')[1]
                        : base64Data;
                    byteCharacters = atob(base64Content);
                    byteArrays = [];
                    for (offset = 0; offset < byteCharacters.length; offset += 512) {
                        slice = byteCharacters.slice(offset, offset + 512);
                        byteNumbers = new Array(slice.length);
                        for (i = 0; i < slice.length; i++) {
                            byteNumbers[i] = slice.charCodeAt(i);
                        }
                        byteArray = new Uint8Array(byteNumbers);
                        byteArrays.push(byteArray);
                    }
                    blob = new Blob(byteArrays, { type: mimeType });
                    file = new File([blob], filename, { type: mimeType });
                    return [2 /*return*/, this.uploadFile(file, metadata)];
                }
                catch (error) {
                    console.error('Failed to upload base64 image to Pinata:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Get JSON content from IPFS via Pinata gateway
     */
    PinataService.prototype.getJSON = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConfigured && !cid) {
                            throw new Error('Pinata service not configured or missing CID.');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(this.gateway).concat(cid))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch JSON from IPFS: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.json()];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_3 = _a.sent();
                        console.error('Failed to get JSON from IPFS:', error_3);
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Fetches an image from IPFS and returns it as a base64 string
     */
    PinataService.prototype.getImageAsBase64 = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            var response, blob_1, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!cid) {
                            throw new Error('CID is required to fetch an image.');
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, fetch("".concat(this.gateway).concat(cid))];
                    case 2:
                        response = _a.sent();
                        if (!response.ok) {
                            throw new Error("Failed to fetch image from IPFS: ".concat(response.statusText));
                        }
                        return [4 /*yield*/, response.blob()];
                    case 3:
                        blob_1 = _a.sent();
                        return [2 /*return*/, new Promise(function (resolve, reject) {
                                var reader = new FileReader();
                                reader.onloadend = function () { return resolve(reader.result); };
                                reader.onerror = reject;
                                reader.readAsDataURL(blob_1);
                            })];
                    case 4:
                        error_4 = _a.sent();
                        console.error('Failed to get image as base64 from IPFS:', error_4);
                        throw error_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Upload campaign metadata to IPFS
     */
    PinataService.prototype.uploadCampaignMetadata = function (metadata) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.uploadJSON(metadata, {
                        type: 'campaign',
                        title: metadata.title,
                        category: metadata.category,
                        created: metadata.created.toString()
                    })];
            });
        });
    };
    /**
     * Get campaign metadata from IPFS
     */
    PinataService.prototype.getCampaignMetadata = function (cid) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getJSON(cid)];
            });
        });
    };
    /**
     * Upload testimonial to IPFS
     */
    PinataService.prototype.uploadTestimonial = function (testimonial) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.uploadJSON(testimonial, {
                        type: 'testimonial',
                        author: testimonial.authorName,
                        campaignId: testimonial.campaignId || ''
                    })];
            });
        });
    };
    /**
     * Upload reward metadata to IPFS
     */
    PinataService.prototype.uploadReward = function (reward) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.uploadJSON(reward, {
                        type: 'reward',
                        title: reward.title,
                        campaignId: reward.campaignId || ''
                    })];
            });
        });
    };
    /**
     * Upload a campaign database containing all campaigns, testimonials, and rewards
     */
    PinataService.prototype.uploadCampaignDatabase = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.uploadJSON(data, {
                        type: 'database',
                        name: 'MedFund Campaign Database',
                        timestamp: Date.now().toString()
                    })];
            });
        });
    };
    return PinataService;
}());
exports.PinataService = PinataService;
