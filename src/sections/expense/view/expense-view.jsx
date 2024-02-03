import { isArray } from 'lodash';
import { useState ,useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
// import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { users } from 'src/_mock/user';
import { getExpense } from 'src/redux/expense/expenseSlice';

// import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';

import AddExpense from '../add-expense';
import TableNoData from '../table-no-data';
import UserTableRow from '../expense-table-row';
import TableEmptyRows from '../table-empty-rows';
import UserTableHead from '../expense-table-head';
import UserTableToolbar from '../expense-table-toolbar';
import { emptyRows, applyFilter, getComparator } from '../utils';

// ----------------------------------------------------------------------

export default function ExpensePage() {
  
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [open, setOpen] = useState(false);

  const dispatch = useDispatch()

  useEffect(()=>{
    dispatch(getExpense())
  },[dispatch])

  const expenses = useSelector((state)=>(state.expense.expense))
  console.log(expenses)

  const handleSort = (event, id) => {
    const isAsc = orderBy === id && order === 'asc';
    if (id !== '') {
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    }
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = users.map((n) => n.name);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };

  const handleFilterByName = (event) => {
    setPage(0);
    setFilterName(event.target.value);
  };

  const dataFiltered = applyFilter({
    inputData: expenses,
    comparator: getComparator(order, orderBy),
    filterName,
  });

  const handleOpen = () => setOpen(true);

  const handleClose = () => setOpen(false);

  const notFound = dataFiltered && !dataFiltered.length && !!filterName;

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Expenses</Typography>
        

        <AddExpense
        open={open}
        handleClose={handleClose}
        handleOpen={handleOpen}
        />

       
      </Stack>

      <Card>
        <UserTableToolbar
          numSelected={selected.length}
          filterName={filterName}
          onFilterName={handleFilterByName}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 800 }}>
              <UserTableHead
                order={order}
                orderBy={orderBy}
                rowCount={users.length}
                numSelected={selected.length}
                onRequestSort={handleSort}
                onSelectAllClick={handleSelectAllClick}
                headLabel={[
                  { id: 'amount', label: 'Amount' },
                  { id: 'category', label: 'Category' },
                  { id: 'description', label: 'Description' },
                  { id: 'date_time', label: 'Date', align: 'center' },
                  { id: '' },
                ]}
              />
              <TableBody>
                { dataFiltered && isArray(dataFiltered) && dataFiltered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) =>{
                    console.log(row)
                    return  (
                      <UserTableRow
                        key={row._id}
                        amount={row.amount}
                        description={row.description}
                        status={row.status}
                        category={row.category}
                        avatarUrl={row.avatarUrl}
                        date={row.date}
                        selected={selected.indexOf(row.name) !== -1}
                        handleClick={(event) => handleClick(event, row.name)}
                      />
                    )
                  })}

                <TableEmptyRows
                  height={77}
                  emptyRows={emptyRows(page, rowsPerPage, users.length)}
                />

                {notFound && <TableNoData query={filterName} />}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>

       {
        expenses &&
        <TablePagination
        page={page}
        component="div"
        count={expenses.length}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
       }
      </Card>
    </Container>
  );
}
