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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSolrCore = void 0;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const errors_1 = require("../utils/errors");
dotenv_1.default.config();
const SOLR_BASE_URL = process.env.SOLR_BASE_URL;
const SOLR_CORE_PREFIX = process.env.SOLR_CORE_PREFIX;
const createSolrCore = (tenantId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const coreName = SOLR_CORE_PREFIX + tenantId;
        const configSet = "talent_management_configs";
        const createCoreUrl = `${SOLR_BASE_URL}/admin/cores?action=CREATE&name=${coreName}&configSet=${configSet}&wt=json`;
        const response = yield axios_1.default.post(createCoreUrl);
        return response.data;
    }
    catch (error) {
        throw new errors_1.HttpInternalServerError(`Something went wrong!`);
    }
});
exports.createSolrCore = createSolrCore;
