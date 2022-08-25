import xlsxPopulate from 'xlsx-populate';

interface IFillRow {
    rowIndex: number;
    row: any;
    cellStyle?: any;
}

interface IFillRows {
    startRowIndex: number;
    rows: Array<any>;
    cellStyle?: any;
}

const A_CHAR_CODE = 65;
const Z_CHAR_CODE = 90;

export class ExcelTemplater {
    static nextColumn(current: string): string {
        let names: string[] = (current || '').toUpperCase().split('');
        if (names.length == 0 || names.length > 2) {
            return String.fromCharCode(A_CHAR_CODE);
        }
        let charCode1: number = names[0].charCodeAt(0);
        let charCode2: number = names[1] ? names[1].charCodeAt(0) : NaN;
        if (isNaN(charCode2)) charCode2 = -1;

        if (charCode2 != -1 && charCode2 >= A_CHAR_CODE) {
            if (charCode2 >= Z_CHAR_CODE) {
                charCode2 = A_CHAR_CODE;
                charCode1 += 1; // TODO: 目前只支援到 ZZ
            } else {
                charCode2 += 1;
            }
        }
        if (names.length == 1) {
            if (charCode1 >= A_CHAR_CODE && charCode1 < Z_CHAR_CODE) {
                charCode1 += 1;
            } else if (charCode1 >= Z_CHAR_CODE) {
                charCode1 = A_CHAR_CODE;
                charCode2 = A_CHAR_CODE;
            } else {
                charCode1 = A_CHAR_CODE;
            }
        }
        let char1 = String.fromCharCode(charCode1);
        let char2 = charCode2 != -1 ? String.fromCharCode(charCode2) : '';
        return `${char1}${char2}`;
    }

    private _workbook: any = null; // workbook
    private _sheet: any = null;

    async load(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            xlsxPopulate.fromFileAsync(path)
                .then(workbook => {
                    this._workbook = workbook;
                    resolve();
                }).catch((err) => {
                    reject(new Error('Can`t open Excel file: ' + path));
                    console.error(err);
                });
        });
    }

    sheet(name: string): void {
        this._sheet = this._workbook.sheet(name);
    }

    duplicate(newSheetName: string, indexOrBeforeSheet?: number | string) {
        this._workbook.cloneSheet(this._sheet, newSheetName, indexOrBeforeSheet);
    }

    destroy(sheetNameOrIndex: string | number) {
        this._workbook.deleteSheet(sheetNameOrIndex);
    }

    fillCell(key: string, value: any, style?: any) {
        if (style) this._sheet.cell(key).style(style);
        this._sheet.cell(key).value(value);
    }

    async fillRow(params: IFillRow): Promise<void> {
        this._createRow(params.row, params.rowIndex, params.cellStyle);
    }

    async fillRows(params: IFillRows): Promise<void> {
        for (let index = 0; index < params.rows.length; index ++) {
            let rowIndex = index + params.startRowIndex;
            this._createRow(params.rows[index], rowIndex, params.cellStyle);
        }
    }

    private _createRow(row: any, rowIndex: number, cellStyle: any) {
        let keys = Object.keys(row);
        let currentColumn = '';
        for (let index = 0; index < keys.length; index++) {
            currentColumn = index == 0 ? 'A' : ExcelTemplater.nextColumn(currentColumn);
            let column = `${currentColumn}${rowIndex}`;
            if (cellStyle) { // styles
                this._sheet.cell(`${column}`).style(cellStyle);
            }
            // values
            this._sheet.cell(`${column}`).value(row[`${keys[index]}`]);
        }
    }

    async save(path: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            this._workbook.toFileAsync(path)
                .then(() => resolve())
                .catch((err) => {
                    reject(new Error('Can`t save Excel file: ' + path));
                    console.error(err);
                })
        });
    }

    async output(): Promise<any> {
        return this._workbook.outputAsync();
    }
}
