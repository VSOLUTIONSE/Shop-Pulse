'use client';

import React, { useState } from 'react';
import {
  useListProducts, 
  useCreateProduct,
  useUpdateProduct,
  useRestockProduct,
  useCorrectProductStock,
  useListCategories,
  useCreateCategory,
  useGetSettings
} from '@/lib/hooks';
import { formatMoney } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Search, 
  Plus,
  PackagePlus,
  Settings2,
  FolderPlus,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

export default function Inventory() {
  const [search, setSearch] = useState('');
  
  const { data: products, isLoading: productsLoading } = useListProducts({ search: search || undefined });
  const { data: categories } = useListCategories();
  const { data: settings } = useGetSettings();
  
  const isOwner = settings?.activeRole === 'owner';
  const { toast } = useToast();

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [correctModalOpen, setCorrectModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  
  const [activeProduct, setActiveProduct] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '', categoryId: '', barcode: '', sellingPrice: '', costPrice: '', stockLevel: '', lowStockThreshold: ''
  });
  
  const [restockData, setRestockData] = useState({ quantity: '', costPrice: '' });
  const [correctData, setCorrectData] = useState({ quantityChange: '', reason: '' });
  const [categoryName, setCategoryName] = useState('');

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const restockProduct = useRestockProduct();
  const correctProduct = useCorrectProductStock();
  const createCategory = useCreateCategory();

  const handleProductSubmit = () => {
    const payload = {
      name: formData.name,
      categoryId: Number(formData.categoryId),
      barcode: formData.barcode || undefined,
      sellingPriceCents: Math.round(Number(formData.sellingPrice) * 100),
      costPriceCents: !activeProduct ? Math.round(Number(formData.costPrice) * 100) : undefined,
      stockLevel: activeProduct ? undefined : Number(formData.stockLevel),
      lowStockThreshold: Number(formData.lowStockThreshold) || settings?.lowStockThreshold || 5,
    };

    const onDone = () => {
      toast({ title: activeProduct ? "Product updated" : "Product created" });
      setProductModalOpen(false);
    };

    if (activeProduct) {
      updateProduct.mutate(activeProduct.id, payload).then(onDone);
    } else {
      createProduct.mutate(payload as any).then(onDone);
    }
  };

  const handleRestock = () => {
    if (!activeProduct) return;
    restockProduct.mutate(
      activeProduct.id,
      Number(restockData.quantity),
      Math.round(Number(restockData.costPrice) * 100)
    ).then(() => {
      toast({ title: "Stock reloaded successfully" });
      setRestockModalOpen(false);
    });
  };

  const handleCorrection = () => {
    if (!activeProduct) return;
    correctProduct.mutate(
      activeProduct.id,
      Number(correctData.quantityChange),
      correctData.reason
    ).then(() => {
      toast({ title: "Inventory corrected" });
      setCorrectModalOpen(false);
    });
  };

  const handleCategorySubmit = () => {
    createCategory.mutate({ name: categoryName }).then(() => {
      toast({ title: "Category added" });
      setCategoryModalOpen(false);
      setCategoryName('');
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Stock & Inventory</h1>
          <p className="text-muted-foreground mt-1">Manage products, pricing, and stock levels.</p>
        </div>
        <div className="flex gap-2">
          {isOwner && (
            <Button variant="outline" onClick={() => setCategoryModalOpen(true)}>
              <FolderPlus className="w-4 h-4 mr-2" /> Categories
            </Button>
          )}
          <Button onClick={() => {
            setActiveProduct(null);
            setFormData({ name: '', categoryId: '', barcode: '', sellingPrice: '', costPrice: '', stockLevel: '0', lowStockThreshold: settings?.lowStockThreshold?.toString() || '5' });
            setProductModalOpen(true);
          }}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-muted/20">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search products by name or barcode..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              {isOwner && <TableHead className="text-right">Cost</TableHead>}
              <TableHead className="text-center">Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsLoading ? (
              Array.from({length: 5}).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={isOwner ? 6 : 5} className="h-16 text-center">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : products?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={isOwner ? 6 : 5} className="h-32 text-center text-muted-foreground">
                  No products found. Add your first product.
                </TableCell>
              </TableRow>
            ) : (
              products?.map(product => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    {product.barcode && <div className="text-xs text-muted-foreground font-mono">{product.barcode}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-normal">{product.categoryName}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-medium text-primary">
                    {formatMoney(product.sellingPriceCents)}
                  </TableCell>
                  {isOwner && (
                    <TableCell className="text-right font-mono text-muted-foreground">
                      {formatMoney(product.costPriceCents)}
                    </TableCell>
                  )}
                  <TableCell className="text-center">
                    <Badge variant={product.stockLevel <= 0 ? "destructive" : product.isLowStock ? "outline" : "default"} 
                      className={product.isLowStock && product.stockLevel > 0 ? "text-orange-500 border-orange-200 bg-orange-50" : "font-mono"}>
                      {product.stockLevel}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Restock"
                      onClick={() => {
                        setActiveProduct(product);
                        setRestockData({ quantity: '', costPrice: (product.costPriceCents ? product.costPriceCents/100 : '').toString() });
                        setRestockModalOpen(true);
                      }}
                    >
                      <PackagePlus className="w-4 h-4 text-green-600" />
                    </Button>
                    {isOwner && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        title="Correction"
                        onClick={() => {
                          setActiveProduct(product);
                          setCorrectData({ quantityChange: '', reason: '' });
                          setCorrectModalOpen(true);
                        }}
                      >
                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      title="Edit"
                      onClick={() => {
                        setActiveProduct(product);
                        setFormData({
                          name: product.name,
                          categoryId: product.categoryId.toString(),
                          barcode: product.barcode || '',
                          sellingPrice: (product.sellingPriceCents / 100).toString(),
                          costPrice: product.costPriceCents ? (product.costPriceCents / 100).toString() : '',
                          stockLevel: product.stockLevel.toString(),
                          lowStockThreshold: product.lowStockThreshold.toString()
                        });
                        setProductModalOpen(true);
                      }}
                    >
                      <Settings2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Product Form Modal */}
      <Dialog open={productModalOpen} onOpenChange={setProductModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{activeProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Name</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Product Name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <select 
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="">Select Category</option>
                  {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Barcode (Optional)</Label>
                <Input value={formData.barcode} onChange={e => setFormData({...formData, barcode: e.target.value})} placeholder="Scan or type" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Selling Price ($)</Label>
                <Input type="number" step="0.01" value={formData.sellingPrice} onChange={e => setFormData({...formData, sellingPrice: e.target.value})} placeholder="0.00" />
              </div>
              {isOwner && (
                <div className="grid gap-2">
                  <Label>Cost Price ($)</Label>
                  <Input type="number" step="0.01" value={formData.costPrice} onChange={e => setFormData({...formData, costPrice: e.target.value})} placeholder="0.00" />
                </div>
              )}
            </div>
            {!activeProduct && (
              <div className="grid gap-2">
                <Label>Initial Stock Level</Label>
                <Input type="number" value={formData.stockLevel} onChange={e => setFormData({...formData, stockLevel: e.target.value})} placeholder="0" />
              </div>
            )}
            <div className="grid gap-2">
              <Label>Low Stock Threshold</Label>
              <Input type="number" value={formData.lowStockThreshold} onChange={e => setFormData({...formData, lowStockThreshold: e.target.value})} placeholder="5" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setProductModalOpen(false)}>Cancel</Button>
            <Button onClick={handleProductSubmit} disabled={createProduct.isPending || updateProduct.isPending}>Save Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Restock Modal */}
      <Dialog open={restockModalOpen} onOpenChange={setRestockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <PackagePlus className="w-5 h-5" /> Load Restock Delivery
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-muted/30 p-3 rounded-lg flex justify-between items-center">
              <span className="font-semibold">{activeProduct?.name}</span>
              <Badge variant="secondary" className="font-mono">Current: {activeProduct?.stockLevel}</Badge>
            </div>
            <div className="grid gap-2">
              <Label>Quantity Added</Label>
              <Input type="number" min="1" value={restockData.quantity} onChange={e => setRestockData({...restockData, quantity: e.target.value})} placeholder="10" />
            </div>
            {isOwner && (
              <div className="grid gap-2">
                <Label>New Cost Price ($) (Updates catalog)</Label>
                <Input type="number" step="0.01" value={restockData.costPrice} onChange={e => setRestockData({...restockData, costPrice: e.target.value})} placeholder="0.00" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockModalOpen(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleRestock} disabled={!restockData.quantity || restockProduct.isPending}>
              Confirm Restock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Correction Modal */}
      <Dialog open={correctModalOpen} onOpenChange={setCorrectModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-orange-500">
              <AlertTriangle className="w-5 h-5" /> Inventory Correction
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
             <div className="bg-muted/30 p-3 rounded-lg flex justify-between items-center">
              <span className="font-semibold">{activeProduct?.name}</span>
              <Badge variant="secondary" className="font-mono">Current: {activeProduct?.stockLevel}</Badge>
            </div>
            <div className="grid gap-2">
              <Label>Quantity Change (use negative for loss/damage)</Label>
              <Input type="number" value={correctData.quantityChange} onChange={e => setCorrectData({...correctData, quantityChange: e.target.value})} placeholder="-2" />
            </div>
            <div className="grid gap-2">
              <Label>Reason for correction (Required)</Label>
              <Input value={correctData.reason} onChange={e => setCorrectData({...correctData, reason: e.target.value})} placeholder="Damaged in transit" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCorrectModalOpen(false)}>Cancel</Button>
            <Button className="bg-orange-600 hover:bg-orange-700 text-white" onClick={handleCorrection} disabled={!correctData.quantityChange || !correctData.reason || correctProduct.isPending}>
              Log Correction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Categories Modal */}
      <Dialog open={categoryModalOpen} onOpenChange={setCategoryModalOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex gap-2">
              <Input value={categoryName} onChange={e => setCategoryName(e.target.value)} placeholder="New Category Name" />
              <Button onClick={handleCategorySubmit} disabled={!categoryName || createCategory.isPending}>Add</Button>
            </div>
            <div className="border border-border/50 rounded-lg divide-y divide-border/50 max-h-60 overflow-auto">
              {categories?.map(c => (
                <div key={c.id} className="p-3 text-sm flex justify-between items-center">
                  <span>{c.name}</span>
                </div>
              ))}
              {categories?.length === 0 && (
                <div className="p-4 text-center text-muted-foreground text-sm">No categories yet</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
