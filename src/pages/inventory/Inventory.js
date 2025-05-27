import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { 
  Box, 
  Typography, 
  Button, 
  CircularProgress, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  IconButton,
  Switch,
  TextField,
  InputAdornment,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip
} from '@mui/material';
import { Search, Clear } from '@mui/icons-material';
import ProductForm from './ProductForm';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Inventory = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch products
        const productsQuery = query(collection(db, 'products'));
        const productsSnapshot = await getDocs(productsQuery);
        const productsData = productsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch categories
        const categoriesQuery = query(collection(db, 'categories'));
        const categoriesSnapshot = await getDocs(categoriesQuery);
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    applyFilters(products, categoryFilter, searchTerm);
  }, [products, categoryFilter, searchTerm]);

  const applyFilters = (productsToFilter, category, search) => {
    let filtered = [...productsToFilter];
    
    // Apply category filter
    if (category !== 'all') {
      filtered = filtered.filter(product => product.categoryId === category);
    }
    
    // Apply search filter
    if (search.trim() !== '') {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(search.toLowerCase()))
      );
    }
    
    setFilteredProducts(filtered);
  };

  const handleAddProduct = async (productData) => {
    try {
      const docRef = await addDoc(collection(db, 'products'), productData);
      const updatedProducts = [...products, { id: docRef.id, ...productData }];
      setProducts(updatedProducts);
      applyFilters(updatedProducts, categoryFilter, searchTerm);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const handleUpdateProduct = async (productData) => {
    try {
      const productRef = doc(db, 'products', editingProduct.id);
      await updateDoc(productRef, productData);
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id ? { ...p, ...productData } : p
      );
      setProducts(updatedProducts);
      applyFilters(updatedProducts, categoryFilter, searchTerm);
      setEditingProduct(null);
      setShowForm(false);
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
      const updatedProducts = products.filter(p => p.id !== productId);
      setProducts(updatedProducts);
      applyFilters(updatedProducts, categoryFilter, searchTerm);
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleToggleAvailability = async (product) => {
    try {
      const productRef = doc(db, 'products', product.id);
      await updateDoc(productRef, { available: !product.available });
      const updatedProducts = products.map(p => 
        p.id === product.id ? { ...p, available: !p.available } : p
      );
      setProducts(updatedProducts);
      applyFilters(updatedProducts, categoryFilter, searchTerm);
    } catch (error) {
      console.error('Error toggling availability:', error);
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Uncategorized';
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Inventory Management
      </Typography>
      
      <Box sx={{ 
        mb: 3,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Button 
          variant="contained" 
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          sx={{ mb: 2 }}
        >
          Add New Product
        </Button>
        
        <Box sx={{ 
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap'
        }}>
          <FormControl sx={{ minWidth: 200 }} size="small">
            <InputLabel id="category-filter-label">Category</InputLabel>
            <Select
              labelId="category-filter-label"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              {categories.map(category => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} size="small">
                    <Clear />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ width: 300 }}
          />
        </Box>
      </Box>
      
      {showForm && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <ProductForm 
            product={editingProduct}
            categories={categories}
            onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </Paper>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Product Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Available</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map(product => (
                <TableRow key={product.id}>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.description}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getCategoryName(product.categoryId)} 
                      size="small"
                    />
                  </TableCell>
                  <TableCell>₱{product.price.toFixed(2)}</TableCell>
                  <TableCell>{product.stock}</TableCell>
                  <TableCell>
                    <Switch
                      checked={product.available}
                      onChange={() => handleToggleAvailability(product)}
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      onClick={() => {
                        setEditingProduct(product);
                        setShowForm(true);
                      }}
                    >
                      <EditIcon color="primary" />
                    </IconButton>
                    <IconButton 
                      onClick={() => handleDeleteProduct(product.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No products found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Inventory;