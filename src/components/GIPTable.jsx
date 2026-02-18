import React from "react";
import { DataGrid, GridActionsCellItem, GridActionsCell } from '@mui/x-data-grid';
import { columns, rows as initialRows } from "../utils/gip_table_def.jsx";
import { ActionHandlerContext } from "./context/ActionCellProvider.jsx";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

export function ActionsCell({ id }) {
    const setActionRowId = React.useContext(ActionHandlerContext);

    if (!setActionRowId) return null;

    return (
        <GridActionsCellItem
            showInMenu
            icon={<DeleteIcon />}
            onClick={() => setActionRowId(id)}
            closeMenuOnClick={false}
        />
    );
}

export function GIPTable() {
    const [rows, setRows] = React.useState(initialRows);
    const [actionRowId, setActionRowId] = React.useState(null);
    const [rowSelectionModel, setRowSelectionModel] = React.useState(new Set());


    const deleteActiveRow = React.useCallback(
        (rowId) => setRows((prevRows) => prevRows.filter((row) => row.id !== rowId)),
        [],
    );

    const handleCloseDialog = React.useCallback(() => {
        setActionRowId(null);
    }, []);

    const handleConfirmDelete = React.useCallback(() => {
        deleteActiveRow(actionRowId);
        handleCloseDialog();
    }, [actionRowId, deleteActiveRow, handleCloseDialog]);

    const handleDeleteSelected = React.useCallback(() => {
        setRows((prevRows) => prevRows.filter((row) => !rowSelectionModel.includes(row.id)));
        setRowSelectionModel(new Set());
    }, [rowSelectionModel]);

    return (
        <>
            <ActionHandlerContext.Provider value={setActionRowId}>

                <DataGrid
                    rows={rows}
                    columns={columns}
                    checkboxSelection
                    disableSelectionOnClick
                    rowSelectionModel={rowSelectionModel}
                    onRowSelectionModelChange={setRowSelectionModel}
                />
                {rowSelectionModel.size > 0 && (
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<DeleteIcon />}
                        onClick={handleDeleteSelected}
                        sx={{ mb: 1 }}
                    >
                        Delete Selected ({rowSelectionModel.size})
                    </Button>
                )}
            </ActionHandlerContext.Provider>
            <Dialog
                open={actionRowId !== null}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">Delete this user?</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="warning" autoFocus>
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
