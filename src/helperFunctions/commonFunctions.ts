export function getPaginationData(queryParams: any) {
  const lastRecordKey = (
    queryParams.lastRecordKey ? parseInt(queryParams.lastRecordKey.toString()) : 0
  ) as number | null;
  const perPage = queryParams.perPage ? parseInt(queryParams.perPage.toString()) : undefined;

  return { lastRecordKey, perPage };
}
