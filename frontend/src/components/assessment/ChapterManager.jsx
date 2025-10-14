import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
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
  Folder as FolderIcon,
  Bookmark as BookmarkIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import assessmentAPI from '../../services/assessment.service';

const ChapterManager = ({ product, type, onChapterSelect, onNotification }) => {
  const { t } = useTranslation();
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [chapterForm, setChapterForm] = useState({
    title: '',
    description: '',
    order: 0
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('order');
  const [order, setOrder] = useState('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [chapterToDelete, setChapterToDelete] = useState(null);

  useEffect(() => {
    if (product) {
      fetchChapters();
    }
  }, [product, type]);

  const fetchChapters = async () => {
    setLoading(true);
    try {
      const result = await assessmentAPI.getChapters(product.id, type);
      if (result.success) {
        setChapters(result.data);
      } else {
        onNotification(result.error, 'error');
      }
    } catch (error) {
      onNotification('Failed to fetch chapters', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddChapter = () => {
    setEditingChapter(null);
    setChapterForm({
      title: '',
      description: '',
      order: chapters.length + 1
    });
    setDialogOpen(true);
  };

  const handleEditChapter = (chapter) => {
    setEditingChapter(chapter);
    setChapterForm({
      title: chapter.title,
      description: chapter.description || '',
      order: chapter.order
    });
    setDialogOpen(true);
  };

  const handleSaveChapter = async () => {
    try {
      const chapterData = {
        ...chapterForm,
        product: product.id
      };

      let result;
      if (editingChapter) {
        result = await assessmentAPI.updateChapter(editingChapter.id, chapterData, type);
      } else {
        result = await assessmentAPI.createChapter(chapterData, type);
      }

      if (result.success) {
        onNotification(
          editingChapter ? 'Chapter updated successfully' : 'Chapter created successfully',
          'success'
        );
        setDialogOpen(false);
        fetchChapters();
      } else {
        onNotification(result.error, 'error');
      }
    } catch (error) {
      onNotification('Failed to save chapter', 'error');
    }
  };

  const handleDeleteChapter = (chapter) => {
    setChapterToDelete(chapter);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteChapter = async () => {
    if (!chapterToDelete) return;
    
    try {
      const result = await assessmentAPI.deleteChapter(chapterToDelete.id, type);
      if (result.success) {
        onNotification('Chapter deleted successfully', 'success');
        fetchChapters();
      } else {
        onNotification(result.error, 'error');
      }
    } catch (error) {
      onNotification('Failed to delete chapter', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setChapterToDelete(null);
    }
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

  const sortedChapters = [...chapters].sort((a, b) => {
    if (orderBy === 'title') {
      return order === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    if (orderBy === 'order') {
      return order === 'asc' 
        ? (a.order || 0) - (b.order || 0)
        : (b.order || 0) - (a.order || 0);
    }
    return 0;
  });

  const paginatedChapters = sortedChapters.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (!product) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a product first
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Floating Add Button */}
      <Box sx={{ position: 'fixed', top: 100, left: 32, zIndex: 1200 }}>
        <IconButton
          onClick={handleAddChapter}
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
          <Typography>Loading chapters...</Typography>
        </Box>
      ) : chapters.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <FolderIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('noChapters')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('createFirstChapter')}
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
                      active={orderBy === 'order'}
                      direction={orderBy === 'order' ? order : 'asc'}
                      onClick={() => handleSort('order')}
                    >
                      {t('order')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={orderBy === 'title'}
                      direction={orderBy === 'title' ? order : 'asc'}
                      onClick={() => handleSort('title')}
                    >
                      {t('chapterTitle')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('description')}</TableCell>
                  <TableCell>{t('topics')}</TableCell>
                  <TableCell>{type === 'questionbank' ? t('questions') : t('flashcards')}</TableCell>
                  <TableCell align="center">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedChapters.map((chapter) => (
                  <TableRow key={chapter.id} hover>
                    <TableCell align="center">
                      <Chip 
                        label={chapter.order}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FolderIcon sx={{ 
                          color: 'primary.main', 
                          fontSize: '1.5rem'
                        }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {chapter.title}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        maxWidth: 300
                      }}>
                        {chapter.description || t('noDescription')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={chapter.topics_count || 0}
                        size="small"
                        variant="outlined"
                        icon={<BookmarkIcon />}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={chapter.questions_count || chapter.flashcards_count || 0}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title={t('manageTopics')}>
                          <IconButton
                            size="small"
                            onClick={() => onChapterSelect(chapter)}
                            sx={{ 
                              bgcolor: 'primary.main',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'primary.dark'
                              }
                            }}
                          >
                            <BookmarkIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('edit')}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditChapter(chapter)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteChapter(chapter)}
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
            count={chapters.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Add/Edit Chapter Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingChapter ? t('editChapter') : t('addChapter')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label={t('chapterTitle')}
              value={chapterForm.title}
              onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label={t('chapterDescription')}
              value={chapterForm.description}
              onChange={(e) => setChapterForm({ ...chapterForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            <TextField
              label={t('order')}
              type="number"
              value={chapterForm.order}
              onChange={(e) => setChapterForm({ ...chapterForm, order: parseInt(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSaveChapter} variant="contained">
            {editingChapter ? t('update') : t('create')}
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
            {t('deleteChapterConfirmMessage')}
          </Typography>
          {chapterToDelete && (
            <Box sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('chapterDetails')}:
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>{t('chapterTitle')}:</strong> {chapterToDelete.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>{t('order')}:</strong> {chapterToDelete.order}
              </Typography>
              <Typography variant="body2">
                <strong>{t('topics')}:</strong> {chapterToDelete.topics_count || 0}
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
            onClick={confirmDeleteChapter}
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

export default ChapterManager;
