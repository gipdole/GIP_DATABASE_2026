import React from "react";
import { DataGrid, GridRowsProp, GridColDef } from "@mui/x-data-grid";
import { columns, rows } from "../utils/gip_constants.js";

export default function GIPTable() {
    return <DataGrid rows={rows} columns={columns} />;
}
