import {
    User,
    Product,
    Order,
    Coupon,
    Banner,
    Category,
    DashboardStats,
    SalesAnalytics,
    ColorOption,
    ProductType,
    PlantType,
} from '../models';

export const MOCK_USERS: User[] = [
    {
        _id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        phone: '9876543210',
        gender: 'male',
        dob: '1990-01-01',
        isAdmin: true,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        totalOrders: 5,
        totalSpent: 15000,
        createdAt: new Date().toISOString(),
    },
    {
        _id: '2',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane@example.com',
        phone: '9876543211',
        gender: 'female',
        dob: '1992-05-15',
        isAdmin: false,
        isActive: true,
        isEmailVerified: true,
        isPhoneVerified: false,
        totalOrders: 2,
        totalSpent: 4500,
        createdAt: new Date().toISOString(),
    },
];

export const MOCK_CATEGORIES: Category[] = [
    { _id: 'c1', name: 'Indoor Plants', createdAt: new Date().toISOString() },
    { _id: 'c2', name: 'Outdoor Plants', createdAt: new Date().toISOString() },
    { _id: 'c3', name: 'Succulents', createdAt: new Date().toISOString() },
    { _id: 'c4', name: 'Pots & Planters', createdAt: new Date().toISOString() },
];

export const MOCK_PRODUCTS: Product[] = [
    {
        _id: 'p1',
        name: 'Snake Plant',
        description: 'A great indoor plant that purifies air.',
        price: 499,
        mrp: 699,
        stock: 50,
        category: 'c1',
        isActive: true,
        isFeatured: true,
        images: ['https://images.unsplash.com/photo-1593482892290-f54927ae1eb6?w=500'],
        createdAt: new Date().toISOString(),
    },
    {
        _id: 'p2',
        name: 'Monstera Deliciosa',
        description: 'The swiss cheese plant.',
        price: 899,
        mrp: 1299,
        stock: 20,
        category: 'c1',
        isActive: true,
        isFeatured: false,
        images: ['https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=500'],
        createdAt: new Date().toISOString(),
    },
    {
        _id: 'p3',
        name: 'Areca Palm',
        description: 'Beautiful palm for your living room.',
        price: 399,
        mrp: 599,
        stock: 10,
        category: 'c1',
        isActive: true,
        isFeatured: true,
        images: ['https://images.unsplash.com/photo-1512423911856-47895e79396d?w=500'],
        createdAt: new Date().toISOString(),
    },
];

export const MOCK_ORDERS: Order[] = [
    {
        _id: 'o1',
        orderNumber: 'ORD-001',
        user: MOCK_USERS[0],
        products: [
            { product: MOCK_PRODUCTS[0], name: MOCK_PRODUCTS[0].name, quantity: 1, price: 499 },
        ],
        totalAmount: 499,
        status: 'delivered',
        paymentMethod: 'UPI',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString(),
    },
    {
        _id: 'o2',
        orderNumber: 'ORD-002',
        user: MOCK_USERS[1],
        products: [
            { product: MOCK_PRODUCTS[1], name: MOCK_PRODUCTS[1].name, quantity: 1, price: 899 },
        ],
        totalAmount: 899,
        status: 'pending',
        paymentMethod: 'COD',
        paymentStatus: 'pending',
        createdAt: new Date().toISOString(),
    },
];

export const MOCK_COUPONS: Coupon[] = [
    {
        _id: 'cp1',
        code: 'WELCOME50',
        description: '50% off for first time users',
        discountType: 'percentage',
        discountValue: 50,
        isActive: true,
        createdAt: new Date().toISOString(),
    },
    {
        _id: 'cp2',
        code: 'FLAT100',
        description: 'Flat Rs. 100 off',
        discountType: 'fixed',
        discountValue: 100,
        isActive: true,
        createdAt: new Date().toISOString(),
    },
];

export const MOCK_BANNERS: Banner[] = [
    {
        _id: 'b1',
        title: 'Spring Collection',
        image: 'https://images.unsplash.com/photo-1463936575829-25148e1db1b8?w=1200',
        isActive: true,
        type: 'promotional',
        createdAt: new Date().toISOString(),
    },
];

export const MOCK_COLORS: ColorOption[] = [
    { _id: 'col1', name: 'Terracotta' },
    { _id: 'col2', name: 'White' },
    { _id: 'col3', name: 'Grey' },
];

export const MOCK_PRODUCT_TYPES: ProductType[] = [
    { _id: 'pt1', name: 'Indoor' },
    { _id: 'pt2', name: 'Outdoor' },
];

export const MOCK_PLANT_TYPES: PlantType[] = [
    { _id: 'plt1', name: 'Succulent' },
    { _id: 'plt2', name: 'Flowering' },
];

export const MOCK_SALES_ANALYTICS: SalesAnalytics = {
    salesByDate: [
        { date: '2024-01-01', amount: 1200, orders: 10 },
        { date: '2024-01-02', amount: 1500, orders: 12 },
        { date: '2024-01-03', amount: 900, orders: 8 },
    ],
    salesByCategory: [
        { category: 'Indoor Plants', amount: 5000 },
        { category: 'Outdoor Plants', amount: 3000 },
    ],
    salesByPaymentMethod: [
        { method: 'UPI', amount: 4500 },
        { method: 'COD', amount: 3500 },
    ],
    topSellingProducts: MOCK_PRODUCTS,
};

export const MOCK_DASHBOARD_STATS: DashboardStats = {
    totalRevenue: 250000,
    totalOrders: 156,
    totalUsers: 1240,
    totalProducts: 45,
    revenueGrowth: 15,
    ordersGrowth: 8,
    usersGrowth: 12,
    productsGrowth: 5,
    recentOrders: MOCK_ORDERS,
    recentUsers: MOCK_USERS,
    topProducts: MOCK_PRODUCTS,
};

export const MOCK_GENERIC_STATS = {
    total: 100,
    growth: 10,
    items: [
        { label: 'Jan', value: 40 },
        { label: 'Feb', value: 30 },
        { label: 'Mar', value: 60 },
    ],
};

export const MOCK_USER_ANALYTICS = {
    totalUsers: 1200,
    activeUsers: 800,
    newUsers: 150,
    growth: 12.5,
    userDemographics: [
        { label: 'Male', value: 55 },
        { label: 'Female', value: 45 },
    ],
};

export const MOCK_PRODUCT_ANALYTICS = {
    totalProducts: 45,
    outOfStock: 5,
    lowStock: 10,
    stats: [
        { label: 'Electronics', count: 15 },
        { label: 'Clothing', count: 20 },
        { label: 'Home Decor', count: 10 },
    ],
};
