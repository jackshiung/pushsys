import { BigQuery as _BigQuery } from '@google-cloud/bigquery';

let bigquery: _BigQuery;

export namespace BigQuery {
    export function initialize(googleMapKey: string): void {
        if (!bigquery) {
            bigquery = new _BigQuery();
        }
    }
}