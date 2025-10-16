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
  Bookmark as BookmarkIcon,
  Quiz as QuizIcon,
  Style as StyleIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import assessmentAPI from '../../services/assessment.service';

const TopicManager = ({ chapter, type, onTopicSelect, onNotification }) => {
  const { t, i18n } = useTranslation();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicForm, setTopicForm] = useState({
    title: '',
    description: '',
    order: 0
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState('order');
  const [order, setOrder] = useState('asc');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState(null);

  useEffect(() => {
    if (chapter) {
      fetchTopics();
    }
  }, [chapter, type]);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const result = await assessmentAPI.getTopics(chapter.id, type);
      if (result.success) {
        setTopics(result.data);
      } else {
        onNotification(result.error, 'error');
      }
    } catch (error) {
      onNotification('Failed to fetch topics', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = () => {
    setEditingTopic(null);
    setTopicForm({
      title: '',
      description: '',
      order: topics.length + 1
    });
    setDialogOpen(true);
  };

  const handleEditTopic = (topic) => {
    setEditingTopic(topic);
    setTopicForm({
      title: topic.title,
      description: topic.description || '',
      order: topic.order
    });
    setDialogOpen(true);
  };

  const handleSaveTopic = async () => {
    try {
      const topicData = {
        ...topicForm,
        chapter: chapter.id
      };

      let result;
      if (editingTopic) {
        result = await assessmentAPI.updateTopic(editingTopic.id, topicData, type);
      } else {
        result = await assessmentAPI.createTopic(topicData, type);
      }

      if (result.success) {
        onNotification(
          editingTopic ? 'Topic updated successfully' : 'Topic created successfully',
          'success'
        );
        setDialogOpen(false);
        fetchTopics();
      } else {
        onNotification(result.error, 'error');
      }
    } catch (error) {
      onNotification('Failed to save topic', 'error');
    }
  };

  const handleDeleteTopic = (topic) => {
    setTopicToDelete(topic);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteTopic = async () => {
    if (!topicToDelete) return;
    
    try {
      const result = await assessmentAPI.deleteTopic(topicToDelete.id, type);
      if (result.success) {
        onNotification('Topic deleted successfully', 'success');
        fetchTopics();
      } else {
        onNotification(result.error, 'error');
      }
    } catch (error) {
      onNotification('Failed to delete topic', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setTopicToDelete(null);
    }
  };

  if (!chapter) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Please select a chapter first
        </Typography>
      </Box>
    );
  }

  const getContentIcon = () => {
    return type === 'questionbank' ? <QuizIcon /> : <StyleIcon />;
  };

  const getContentLabel = () => {
    return type === 'questionbank' ? t('assessment.questions') : t('assessment.flashcards');
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

  const sortedTopics = [...topics].sort((a, b) => {
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

  const paginatedTopics = sortedTopics.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Box>
      {/* Floating Add Button */}
      <Box sx={{ 
        position: 'fixed', 
        top: 100, 
        [i18n.language === 'en' ? 'right' : 'left']: 32, 
        zIndex: 1200 
      }}>
        <IconButton
          onClick={handleAddTopic}
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
          <Typography>Loading topics...</Typography>
        </Box>
      ) : topics.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 4 }}>
          <CardContent>
            <BookmarkIcon sx={{ fontSize: '4rem', color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {t('noTopics')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('createFirstTopic')}
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
                      {t('topicTitle')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>{t('description')}</TableCell>
                  <TableCell>{type === 'questionbank' ? t('questions') : t('flashcards')}</TableCell>
                  <TableCell align="center">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTopics.map((topic) => (
                  <TableRow key={topic.id} hover>
                    <TableCell align="center">
                      <Chip 
                        label={topic.order}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BookmarkIcon sx={{ 
                          color: 'primary.main', 
                          fontSize: '1.5rem'
                        }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {topic.title}
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
                        {topic.description || t('noDescription')}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={topic.questions_count || topic.flashcards_count || 0}
                        size="small"
                        variant="outlined"
                        icon={getContentIcon()}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                        <Tooltip title={type === 'questionbank' ? t('manageQuestions') : t('manageFlashcards')}>
                          <IconButton
                            size="small"
                            onClick={() => onTopicSelect(topic)}
                            sx={{ 
                              bgcolor: 'primary.main',
                              color: 'white',
                              '&:hover': {
                                bgcolor: 'primary.dark'
                              }
                            }}
                          >
                            {getContentIcon()}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('edit')}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditTopic(topic)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={t('delete')}>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteTopic(topic)}
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
            count={topics.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Add/Edit Topic Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTopic ? t('editTopic') : t('addTopic')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label={t('topicTitle')}
              value={topicForm.title}
              onChange={(e) => setTopicForm({ ...topicForm, title: e.target.value })}
              fullWidth
              required
            />
            
            <TextField
              label={t('topicDescription')}
              value={topicForm.description}
              onChange={(e) => setTopicForm({ ...topicForm, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />

            <TextField
              label={t('order')}
              type="number"
              value={topicForm.order}
              onChange={(e) => setTopicForm({ ...topicForm, order: parseInt(e.target.value) || 0 })}
              fullWidth
              inputProps={{ min: 0 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('cancel')}
          </Button>
          <Button onClick={handleSaveTopic} variant="contained">
            {editingTopic ? t('update') : t('create')}
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
            {t('deleteTopicConfirmMessage')}
          </Typography>
          {topicToDelete && (
            <Box sx={{ 
              bgcolor: 'grey.50', 
              p: 2, 
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.200'
            }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {t('topicDetails')}:
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>{t('topicTitle')}:</strong> {topicToDelete.title}
              </Typography>
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>{t('order')}:</strong> {topicToDelete.order}
              </Typography>
              <Typography variant="body2">
                <strong>{type === 'questionbank' ? t('questions') : t('flashcards')}:</strong> {topicToDelete.questions_count || topicToDelete.flashcards_count || 0}
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
            onClick={confirmDeleteTopic}
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

export default TopicManager;
