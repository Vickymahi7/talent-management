import axios, { AxiosError } from "axios";
import dotenv from "dotenv";
import HrProfile from "../models/HrProfile";
import QueryParams from "../types/QueryParams";
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
};

export const deleteSolrCore = async (tenantId: number) => {
  try {
    const coreName = SOLR_CORE_PREFIX + tenantId;

    const createCoreUrl = `${SOLR_BASE_URL}/admin/cores?action=UNLOAD&core=${coreName}&wt=json`;

    const response = await axios.delete(createCoreUrl);
    return response;
  } catch (error) {
    throw new HttpInternalServerError(`Something went wrong!`);
  }
};

export const getHrProfileFromSolr = async (
  solrCore: string,
  queryParams: QueryParams
) => {
  try {
    let response = await axios.get(`${SOLR_BASE_URL}/${solrCore}/select`, {
      params: queryParams,
    });
    const { numFound } = response.data.response;

    const hrProfileList = response.data.response.docs.map((data: any) => ({
      ...data,
      skills: data.skills?.map((item) => JSON.parse(item)),
      work_experience: data.work_experience?.map((item) => JSON.parse(item)),
      project: data.project?.map((item) => JSON.parse(item)),
      education: data.education?.map((item) => JSON.parse(item)),
      docs: data.docs?.map((item) => JSON.parse(item)),
    }));

    return { hrProfileList, total: numFound };
  } catch (error) {
    throw new HttpInternalServerError(`Something went wrong!`);
  }
};

export async function hrProfileSolrUpdate(
  req: any,
  reqData: any
): Promise<any> {
  const solrCore = SOLR_CORE_PREFIX! + req.headers.tenantId;
  /* exptract id & _version_ from req because
    id should be sent separately
    _version_ should not be sent while updating */
  const { id, _version_, ...updateValues } = reqData;

  updateValues.last_updated_dt = new Date();

  const hrProfile = new HrProfile(updateValues);

  let updatePayload = {
    id: id,
  };
  for (const prop in updateValues) {
    updatePayload[prop] = { set: hrProfile[prop] };
  }

  return await axios.patch(`${SOLR_BASE_URL}/${solrCore}/update?commit=true`, {
    add: { doc: updatePayload },
    commit: {},
  });
}
