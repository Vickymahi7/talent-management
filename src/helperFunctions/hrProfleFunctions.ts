import axios from "axios";
import dotenv from "dotenv";
import { HttpInternalServerError } from "../types/errors";
dotenv.config();

const SOLR_BASE_URL = process.env.SOLR_BASE_URL!;
const SOLR_CORE_PREFIX = process.env.SOLR_CORE_PREFIX!;

export const createSolrCore = async (tenantId: number) => {
  try {
    const coreName = SOLR_CORE_PREFIX + tenantId;
    const configSet = "talent_management_configs";

    const createCoreUrl = `${SOLR_BASE_URL}/admin/cores?action=CREATE&name=${coreName}&configSet=${configSet}&wt=json`;

    const response = await axios.post(createCoreUrl);
    return response.data;
  } catch (error) {
    throw new HttpInternalServerError(`Something went wrong!`);
  }
}