import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Chip,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  TableSortLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Store as StoreIcon,
  AttachMoney as PriceIcon,
  School as CourseIcon,
  Folder as FolderIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import assessmentAPI from '../../services/assessment.service';
import courseService from '../../services/courseService';

const ProductSelector = ({ type, onProductSelect, onNotification }) => {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    title: '',
    description: '',
    course: '',
    price: 0,
    is_free: false,
    status: 'draft',
    tags: []
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('title');
  const [order, setOrder] = useState('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCourses();
  }, [type]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const result = type === 'questionbank' 
        ? await assessmentAPI.getQuestionBankProducts()
        : await assessmentAPI.getFlashcardProducts();
      
      if (result.success) {
        setProducts(result.data);
      } else {
        onNotification(result.error, 'error');
      }
    } catch (error) {
      onNotification('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const res = await courseService.getCourses({ page_size: 100 });
      // Normalize various possible API shapes
      const normalized = Array.isArray(res)
        ? res
        : (res?.results ?? res?.data ?? []);
      setCourses(normalized || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      title: '',
      description: '',
      course: '',
      price: 0,
      is_free: false,
      status: 'draft',
      tags: []
    });
    setDialogOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description || '',
      course: product.course,
      price: product.price,
      is_free: product.is_free,
      status: product.status,
      tags: product.tags || []
    });
    setDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      if (!productForm.title?.trim()) {
        onNotification(t('courseTitle') + ' ' + t('errorOccurred'), 'error');
        return;
      }
      if (!productForm.course) {
        onNotification(t('course') + ' ' + t('errorOccurred'), 'error');
        return;
      }
      if (!productForm.is_free && (!productForm.price || Number(productForm.price) <= 0)) {
        onNotification(t('price') + ' ' + t('errorOccurred'), 'error');
        return;
      }
      const productData = {
        ...productForm,
        price: productForm.is_free ? 0 : productForm.price
      };

      let result;
      if (editingProduct) {
        result = type === 'questionbank'
          ? await assessmentAPI.updateQuestionBankProduct(editingProduct.id, productData)
          : await assessmentAPI.updateFlashcardProduct(editingProduct.id, productData);
      } else {
        result = type === 'questionbank'
          ? await assessmentAPI.createQuestionBankProduct(productData)
          : await assessmentAPI.createFlashcardProduct(productData);
      }

      if (result.success) {
        onNotification(
          editingProduct ? 'Product updated successfully' : 'Product created successfully',
          'success'
        );
        setDialogOpen(false);
        fetchProducts();
      } else {
        onNotification(result.error, 'error');
      }
    } catch (error) {
      onNotification('Failed to save product', 'error');
    }
  };

  const handleDeleteProduct = (product) => {
    setProductToDelete(product);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    
    try {
      const result = type === 'questionbank'
        ? await assessmentAPI.deleteQuestionBankProduct(productToDelete.id)
        : await assessmentAPI.deleteFlashcardProduct(productToDelete.id);

      if (result.success) {
        onNotification('Product deleted successfully', 'success');
        fetchProducts();
      } else {
        onNotification(result.error, 'error');
      }
    } catch (error) {
      onNotification('Failed to delete product', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };

  const getProductTypeLabel = () => {
    return type === 'questionbank' ? t('questionBank') : t('flashcards');
  };

  const getProductIcon = () => {
    return type === 'questionbank' ? 'quiz' : 'style';
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (orderBy === 'title') {
      return order === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    if (orderBy === 'price') {
      return order === 'asc' 
        ? (a.price || 0) - (b.price || 0)
        : (b.price || 0) - (a.price || 0);
    }
    if (orderBy === 'status') {
      return order === 'asc' 
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    return 0;
  });

  const paginatedProducts = sortedProducts.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Floating Add Button */}
      <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
        <IconButton
          onClick={handleAddProduct}
          sx={{
            width: 56,
            height: 56,
            background: 'linear-gradient(90deg, #333679 0%, #4DBFB3 100%)',
            boxShadow: '0 4px 20px rgba(14, 81, 129, 0.3)',
            color: 'white',
            '&:hover': {
              background: 'linear-gradient(90deg, #0a3d5f 0%, #d17a6e 100%)',
              boxShadow: '0 6px 25px rgba(14, 81, 129, 0.4)',
              transform: 'translateY(-2px)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <AddIcon sx={{ fontSize: 28 }} />
        </IconButton>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography>Loading products...</Typography>
        </Box>
      ) : products.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <StoreIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('noProducts')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('createFirstProduct')}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'title'}
                      direction={orderBy === 'title' ? order : 'asc'}
                      onClick={() => handleSort('title')}
                    >
                      {t('courseTitle')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('course')}</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'price'}
                      direction={orderBy === 'price' ? order : 'asc'}
                      onClick={() => handleSort('price')}
                    >
                      {t('price')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'status'}
                      direction={orderBy === 'status' ? order : 'asc'}
                      onClick={() => handleSort('status')}
                    >
                      {t('status')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('chapters')}</TableCell>
                  <TableCell>{type === 'questionbank' ? t('questions') : t('flashcards')}</TableCell>
                  <TableCell align="center">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedProducts.map((product) => (
                  <TableRow key={product.id} hover>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                          <StoreIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {product.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ 
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}>
                            {product.description || t('noDescription')}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CourseIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {product.course_title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PriceIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {product.is_free ? t('assessment.free') : `$${product.price}`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={product.status}
                        size="small"
                        color={product.status === 'published' ? 'success' : 'default'}
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={product.chapters_count || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={product.questions_count || product.flashcards_count || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title={t('manageChapters')}>
                          <IconButton
                            size="small"
                            onClick={() => onProductSelect(product)}
                            sx={{ 
                              bgcolor: 'primary.main',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'primary.dark'
                              }
                            }}
                          >
                            <FolderIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('edit')}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditProduct(product)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteProduct(product)}
                            sx={{ color: 'error.main' }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={products.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingProduct ? t('editProduct') : t('addProduct')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label={t('courseTitle')}
              value={productForm.title}
              onChange={(e) => setProductForm({ ...productForm, title: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label={t('description')}
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            <FormControl fullWidth required>
              <InputLabel>{t('course')}</InputLabel>
              <Select
                value={productForm.course}
                onChange={(e) => setProductForm({ ...productForm, course: e.target.value })}
                label={t('course')}
              >
                {courses.map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Switch
                  checked={productForm.is_free}
                  onChange={(e) => setProductForm({ ...productForm, is_free: e.target.checked })}
                />
              }
              label={t('isFree')}
            />

            {!productForm.is_free && (
              <TextField
                label={t('price')}
                type="number"
                value={productForm.price}
                onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) || 0 })}
                fullWidth
                inputProps={{ min: 0, step: 0.01 }}
              />
            )}

            <FormControl fullWidth>
              <InputLabel>{t('status')}</InputLabel>
              <Select
                value={productForm.status}
                onChange={(e) => setProductForm({ ...productForm, status: e.target.value })}
                label={t('status')}
              >
                <MenuItem value="draft">{t('draft')}</MenuItem>
                <MenuItem value="published">{t('published')}</MenuItem>
                <MenuItem value="archived">{t('archived')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSaveProduct} variant="contained">
            {editingProduct ? t('update') : t('create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          color: 'error.main',
          pb: 1
        }}>
          <DeleteIcon sx={{ fontSize: '1.5rem' }} />
          {t('confirmDelete')}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('deleteProductConfirmMessage')}
          </Typography>
          {productToDelete && (
            <Box sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('productDetails')}:
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>{t('courseTitle')}:</strong> {productToDelete.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>{t('course')}:</strong> {productToDelete.course_title}
              </Typography>
              <Typography variant="body2">
                <strong>{t('status')}:</strong> {productToDelete.status}
              </Typography>
            </Box>
          )}
          <Typography variant="body2" color="error.main" sx={{ mt: 2, fontWeight: 600 }}>
            {t('deleteWarning')}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            {t('cancel')}
          </Button>
          <Button 
            onClick={confirmDeleteProduct}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
          >
            {t('delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductSelector;
