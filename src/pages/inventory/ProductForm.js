// src/pages/inventory/ProductForm.js
import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  FormControlLabel, 
  Checkbox, 
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
  Paper,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { db } from '../../firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';

const ProductForm = ({ product, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    stock: product?.stock || 0,
    available: product?.available !== false,
    categoryId: product?.categoryId || ''
  });

  const [categories, setCategories] = useState([]);
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCategories(categoriesData);
    };

    fetchCategories();

    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        stock: product.stock || 0,
        available: product.available !== false,
        categoryId: product.categoryId || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        available: true,
        categoryId: ''
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      available: formData.available,
      categoryId: formData.categoryId
    });
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const docRef = await addDoc(collection(db, 'categories'), {
        name: newCategory,
        createdAt: new Date()
      });
      
      setCategories([...categories, { id: docRef.id, name: newCategory }]);
      setFormData(prev => ({ ...prev, categoryId: docRef.id }));
      setNewCategory('');
      setOpenCategoryDialog(false);
    } catch (error) {
      console.error("Error adding category: ", error);
    }
  };

  return (
    <Card elevation={0} sx={{ 
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      overflow: 'hidden'
    }}>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h5" gutterBottom sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center'
              }}>
                {product ? 'Edit Product' : 'Add New Product'}
              </Typography>
              <Divider sx={{ mb: 3 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="name"
                label="Product Name"
                value={formData.name}
                onChange={handleChange}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="category-label" sx={{ 
                  transform: 'translate(14px, 14px) scale(1)',
                  '&.Mui-focused': {
                    transform: 'translate(14px, -9px) scale(0.75)'
                  },
                  '&.MuiFormLabel-filled': {
                    transform: 'translate(14px, -9px) scale(0.75)'
                  }
                }}>
                  Category
                </InputLabel>
                <Select
                  labelId="category-label"
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  label="Category"
                  required
                  sx={{
                    borderRadius: '8px',
                    '& .MuiSelect-select': {
                      minWidth: '200px' // Wider select field
                    }
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 300 // Limit dropdown height
                      }
                    }
                  }}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id} sx={{ 
                      minWidth: '200px', // Wider menu items
                      whiteSpace: 'normal' // Allow text wrapping
                    }}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
                <Box sx={{ mt: 1, textAlign: 'right' }}>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={() => setOpenCategoryDialog(true)}
                    size="small"
                    sx={{ 
                      textTransform: 'none',
                      color: 'primary.main'
                    }}
                  >
                    Add New Category
                  </Button>
                </Box>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="price"
                label="Price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                inputProps={{ min: 0, step: 0.01 }}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">K</InputAdornment>,
                }}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                name="stock"
                label="Stock Quantity"
                type="number"
                value={formData.stock}
                onChange={handleChange}
                inputProps={{ min: 0 }}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    name="available"
                    checked={formData.available}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    Available for purchase
                  </Typography>
                }
                sx={{ 
                  backgroundColor: formData.available ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)',
                  borderRadius: '8px',
                  px: 2,
                  py: 1,
                  m: 0
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 2,
                mt: 3
              }}>
                <Button 
                  variant="outlined" 
                  onClick={onCancel}
                  sx={{
                    borderRadius: '8px',
                    px: 4,
                    textTransform: 'none'
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  sx={{
                    borderRadius: '8px',
                    px: 4,
                    textTransform: 'none'
                  }}
                >
                  {product ? 'Update Product' : 'Add Product'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </CardContent>

      {/* Add New Category Dialog */}
      <Dialog 
        open={openCategoryDialog} 
        onClose={() => setOpenCategoryDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle sx={{ 
          backgroundColor: 'primary.main',
          color: 'white'
        }}>
          Add New Category
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={() => setOpenCategoryDialog(false)}
            sx={{
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddCategory}
            variant="contained"
            disabled={!newCategory.trim()}
            sx={{
              borderRadius: '8px',
              textTransform: 'none'
            }}
          >
            Add Category
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default ProductForm;