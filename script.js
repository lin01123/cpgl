// 全局变量
let products = [];
let currentProductId = null;
let currentProductForDelete = null;
let colorOptions = []; // 当前编辑的颜色选项

const TIKTOK_LINK_PREFIX = 'http://www.tiktok.com/view/product/';
const TIKTOK_LINK_SUFFIX = '?_svg=3';

// DOM 元素
const productList = document.getElementById('productList');
const noProducts = document.getElementById('noProducts');
const productFormOverlay = document.getElementById('productFormOverlay');
const productDetailOverlay = document.getElementById('productDetailOverlay');
const deleteConfirmOverlay = document.getElementById('deleteConfirmOverlay');
const productForm = document.getElementById('productForm');
const formTitle = document.getElementById('formTitle');
const productDetail = document.getElementById('productDetail');
const pasteImportOverlay = document.getElementById('pasteImportOverlay');
const pasteUrl = document.getElementById('pasteUrl');
const loadPasteUrlBtn = document.getElementById('loadPasteUrlBtn');
const pasteInput = document.getElementById('pasteInput');
const pasteStatus = document.getElementById('pasteStatus');
const pastePreview = document.getElementById('pastePreview');
const pastePreviewContent = document.getElementById('pastePreviewContent');

// 店铺筛选
const shopFilterContainer = document.getElementById('shopFilter');
let currentShopFilter = 'all';

// 按钮
const addProductBtn = document.getElementById('addProductBtn');
const webpageContainer = document.querySelector('.webpage-container');
const exportDataBtn = document.getElementById('exportDataBtn');
const importDataBtn = document.getElementById("importDataBtn");
const pasteImportBtn = document.getElementById("pasteImportBtn");
const cancelBtn = document.getElementById('cancelBtn');
const closeDetailBtn = document.getElementById('closeDetailBtn');
const topRightCloseBtn = document.getElementById('topRightCloseBtn');
const editProductBtn = document.getElementById('editProductBtn');
const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const cancelPasteImportBtn = document.getElementById("cancelPasteImportBtn");
const parsePasteBtn = document.getElementById("parsePasteBtn");
const confirmPasteImportBtn = document.getElementById("confirmPasteImportBtn");
const copyLinkBtn = document.getElementById('copyLinkBtn');
const searchBtn = document.getElementById('searchBtn');
const searchInput = document.getElementById('searchInput');
const addColorBtn = document.getElementById('addColorBtn');
const tiktokFrame = document.getElementById('tiktokFrame');

// 表单字段
const productId = document.getElementById('productId');
const productName = document.getElementById('productName');
const shopName = document.getElementById('shopName');
const productCode = document.getElementById('productCode');
const productPrice = document.getElementById('productPrice');
const productCurrency = document.getElementById('productCurrency');
const productColor = document.getElementById('productColor');
const colorImage = document.getElementById('colorImage');
const colorOptionsList = document.getElementById('colorOptionsList');
const productDescription = document.getElementById('productDescription');

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    loadProductsFromLocalStorage();
    renderProductList();
    renderShopFilters();
    setupEventListeners();
});

// 设置事件监听器
function setupEventListeners() {
    // 按钮事件
    addProductBtn.addEventListener('click', toggleIframeVisibility);
    pasteImportBtn.addEventListener("click", showPasteImportForm);
    exportDataBtn.addEventListener('click', exportDataToJson);
    importDataBtn.addEventListener('click', showImportDataDialog);
    cancelBtn.addEventListener('click', hideProductForm);
    closeDetailBtn.addEventListener('click', hideProductDetail);
    topRightCloseBtn.addEventListener('click', hideProductDetail);
    editProductBtn.addEventListener('click', editCurrentProduct);
    cancelDeleteBtn.addEventListener('click', hideDeleteConfirm);
    confirmDeleteBtn.addEventListener('click', deleteProduct);
    cancelPasteImportBtn.addEventListener("click", hidePasteImportForm);
    parsePasteBtn.addEventListener("click", parsePastedData);
    confirmPasteImportBtn.addEventListener("click", confirmPasteImport);
    loadPasteUrlBtn.addEventListener("click", loadPasteUrlContent);
    searchBtn.addEventListener('click', handleSearch);
    addColorBtn.addEventListener('click', addColorOption);
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => copyTiktokProductLink(currentProductId));
    }

    // 表单事件
    productForm.addEventListener('submit', handleFormSubmit);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });

    // 点击遮罩层关闭弹窗
    productFormOverlay.addEventListener('click', (e) => {
        if (e.target === productFormOverlay) {
            hideProductForm();
        }
    });

    productDetailOverlay.addEventListener('click', (e) => {
        if (e.target === productDetailOverlay) {
            hideProductDetail();
        }
    });

    deleteConfirmOverlay.addEventListener('click', (e) => {
        if (e.target === deleteConfirmOverlay) {
            hideDeleteConfirm();
        }
    });


    enableQrDrop(searchInput);
    if (productCode) {
        enableQrDrop(productCode);
    }

}

// 从 localStorage 加载产品数据
function loadProductsFromLocalStorage() {
    const storedProducts = localStorage.getItem('products');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    }
}

// 保存产品数据到 localStorage
function saveProductsToLocalStorage() {
    localStorage.setItem('products', JSON.stringify(products));
}

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 渲染产品列表
function renderProductList(filteredProducts = null) {
    let productsToRender = filteredProducts || products;
    if (currentShopFilter !== 'all') {
        productsToRender = productsToRender.filter(p => p.shopName === currentShopFilter);
    }
    
    // 清空产品列表
    productList.innerHTML = '';
    
    if (productsToRender.length === 0) {
        productList.appendChild(noProducts);
    } else {
        noProducts.remove();
        
        productsToRender.forEach(product => {
            const productCard = createProductCard(product);
            productList.appendChild(productCard);
        });
    }
}

// 渲染店铺筛选按钮
function renderShopFilters() {
    if (!shopFilterContainer) return;
    const shopNames = Array.from(new Set(products.map(p => p.shopName).filter(Boolean)));
    shopFilterContainer.innerHTML = '';

    const allBtn = document.createElement('button');
    allBtn.textContent = '全部';
    allBtn.className = 'shop-filter-btn' + (currentShopFilter === 'all' ? ' active' : '');
    allBtn.addEventListener('click', () => {
        currentShopFilter = 'all';
        renderShopFilters();
        renderProductList();
    });
    shopFilterContainer.appendChild(allBtn);

    shopNames.forEach(name => {
        const btn = document.createElement('button');
        btn.textContent = name;
        btn.className = 'shop-filter-btn' + (currentShopFilter === name ? ' active' : '');
        btn.addEventListener('click', () => {
            currentShopFilter = name;
            renderShopFilters();
            renderProductList();
        });
        shopFilterContainer.appendChild(btn);
    });
}

// 创建产品卡片
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    
    // 处理价格显示（TikTok风格）
    let priceHtml = '';
    if (product.price && product.price > 0) {
        const currency = product.currency || '$';
        const priceStr = product.price.toString();
        const [mainPart, decimalPart] = priceStr.split('.');
        
        priceHtml = `
            <div class="product-price">
                <span class="price-currency">${currency}</span>
                <span class="price-main">${mainPart}</span>
                ${decimalPart ? `<span class="price-decimal">.${decimalPart.padEnd(2, '0')}</span>` : ''}
            </div>
        `;
    }
    
    
    // 处理颜色选项显示
    let colorOptionsHtml = '';
    if (product.colorOptions && product.colorOptions.length > 0) {
        const colorElements = product.colorOptions.map(color => {
            const imageHtml = color.image ? 
                `<img src="${color.image}" alt="${color.name}" class="color-option-image" onerror="this.style.display='none';">` :
                `<div class="color-option-image" style="background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">无图</div>`;
            
            return `
                <div class="color-option-item ${color.selected ? 'selected' : ''}">
                    ${imageHtml}
                    <span class="color-option-name">${color.name}</span>
                </div>
            `;
        }).join('');
        
        colorOptionsHtml = `
            <div class="color-options-display">
                <div class="color-options-title">颜色:</div>
                <div class="color-options-grid">${colorElements}</div>
            </div>
        `;
    }
    
    card.innerHTML = `
        <div class="product-info">
            <div class="product-meta">
                ${product.shopName ? `<div class="meta-item">店铺: ${product.shopName}</div>` : ''}
                ${product.productCode ? `<div class="meta-item">商品ID: ${product.productCode}</div>` : ''}
            </div>
            ${colorOptionsHtml}
        </div>
        <div class="card-actions">
            <button class="action-btn view" data-id="${product.id}">查看</button>
            <button class="action-btn edit" data-id="${product.id}">编辑</button>
            <button class="action-btn delete" data-id="${product.id}">删除</button>
            ${product.productCode ? `<button class="action-btn copy-link" data-id="${product.id}">复制链接</button>` : ''}
        </div>
    `;
    
    // 添加事件监听器
    const viewBtn = card.querySelector('.view');
    const editBtn = card.querySelector('.edit');
    const deleteBtn = card.querySelector('.delete');
    const copyLinkBtn = card.querySelector('.copy-link');
    if (viewBtn) {
        viewBtn.addEventListener('click', () => showProductDetail(product.id));
    }
    
    if (editBtn) {
        editBtn.addEventListener('click', () => showEditForm(product.id));
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => showDeleteConfirm(product.id));
    }

    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => copyTiktokProductLink(product.id));
    }


    return card;
}

// 切换iframe显示/隐藏
function toggleIframeVisibility() {
    if (!webpageContainer) return;
    const isHidden = webpageContainer.style.display === 'none';
    webpageContainer.style.display = isHidden ? 'block' : 'none';
}

// 显示添加表单
function showAddForm() {
    // 重置表单
    productForm.reset();
    productId.value = '';
    colorOptions = [];
    renderColorOptionsList();
    
    // 设置表单标题
    formTitle.textContent = '添加新产品';
    
    // 显示表单
    productFormOverlay.style.display = 'flex';
}

// 显示编辑表单
function showEditForm(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    currentProductId = id;
    
    // 填充表单数据
    productId.value = product.id || '';
    productName.value = product.name || '';
    shopName.value = product.shopName || '';
    productCode.value = product.productCode || '';
    productPrice.value = product.price || '';
    productCurrency.value = product.currency || '$';
    productDescription.value = product.description || '';
    
    // 设置颜色选项
    colorOptions = product.colorOptions ? [...product.colorOptions] : [];
    renderColorOptionsList();
    
    
    // 设置表单标题
    formTitle.textContent = '编辑产品';
    
    // 显示表单
    productFormOverlay.style.display = 'flex';
}

// 隐藏产品表单
function hideProductForm() {
    productFormOverlay.style.display = 'none';
    currentProductId = null;
    colorOptions = [];
}

// 添加颜色选项
function addColorOption() {
    const colorName = productColor.value.trim();
    const colorImageUrl = colorImage.value.trim();
    
    if (!colorName) {
        alert('请输入颜色名称');
        return;
    }
    
    // 检查是否已存在相同颜色
    if (colorOptions.some(option => option.name.toLowerCase() === colorName.toLowerCase())) {
        alert('该颜色已存在');
        return;
    }
    
    // 添加新颜色选项
    colorOptions.push({
        name: colorName,
        image: colorImageUrl,
        selected: colorOptions.length === 0 // 第一个颜色默认选中
    });
    
    // 清空输入框
    productColor.value = '';
    colorImage.value = '';
    
    // 重新渲染颜色选项列表
    renderColorOptionsList();
}

// 渲染颜色选项列表
function renderColorOptionsList() {
    colorOptionsList.innerHTML = '';
    
    colorOptions.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'color-option-form-item';
        
        const imageHtml = option.image ? 
            `<img src="${option.image}" alt="${option.name}" class="color-option-image" onerror="this.style.display='none';">` :
            `<div class="color-option-image" style="background-color: #f0f0f0; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #999;">无图</div>`;
        
        optionElement.innerHTML = `
            ${imageHtml}
            <span class="color-option-name">${option.name}</span>
            <button type="button" class="remove-color" onclick="removeColorOption(${index})">&times;</button>
        `;
        
        colorOptionsList.appendChild(optionElement);
    });
}

// 移除颜色选项
function removeColorOption(index) {
    colorOptions.splice(index, 1);
    renderColorOptionsList();
}

// 处理表单提交
function handleFormSubmit(e) {
    e.preventDefault();
    
    // 获取表单数据
    const formData = {
        name: productName.value,
        shopName: shopName.value,
        productCode: productCode.value,
        price: productPrice.value ? parseFloat(productPrice.value) : null,
        currency: productCurrency.value,
        description: productDescription.value,
        colorOptions: [...colorOptions]
    };
    
    // 如果是编辑现有产品
    if (currentProductId) {
        const index = products.findIndex(p => p.id === currentProductId);
        if (index !== -1) {
            formData.id = currentProductId;
            products[index] = formData;
        }
    } else {
        // 添加新产品
        formData.id = generateId();
        products.push(formData);
    }
    
    // 保存到 localStorage
    saveProductsToLocalStorage();
    
    // 重新渲染产品列表
    renderProductList();
    renderShopFilters();
    
    // 隐藏表单
    hideProductForm();
}

// 处理图片URL预览

// 显示产品详情
function showProductDetail(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    currentProductId = id;
    
    // 构建详情HTML
    let detailHtml = '';
    
    
    // 基本信息
    detailHtml += `
        <div class="detail-section">
            <div class="detail-label">商品名称</div>
            <div class="detail-value">${product.name}</div>
        </div>
    `;
    
    // 价格
    if (product.price && product.price > 0) {
        const currency = product.currency || '$';
        detailHtml += `
            <div class="detail-section">
                <div class="detail-label">价格</div>
                <div class="detail-value">${currency}${product.price}</div>
            </div>
        `;
    }
    
    // 店铺名称
    if (product.shopName) {
        detailHtml += `
            <div class="detail-section">
                <div class="detail-label">店铺名称</div>
                <div class="detail-value">${product.shopName}</div>
            </div>
        `;
    }
    
    // 商品ID
    if (product.productCode) {
        detailHtml += `
            <div class="detail-section">
                <div class="detail-label">商品ID</div>
                <div class="detail-value">${product.productCode}</div>
            </div>
        `;
    }
    
    
    // 颜色选项
    if (product.colorOptions && product.colorOptions.length > 0) {
        const colorOptionsHtml = product.colorOptions.map(color => {
            const imageHtml = color.image ? 
                `<img src="${color.image}" alt="${color.name}" class="color-option-image">` :
                `<div class="color-option-image" style="background-color: #f0f0f0;"></div>`;
            
            return `
                <div class="color-option-item ${color.selected ? 'selected' : ''}">
                    ${imageHtml}
                    <span class="color-option-name">${color.name}</span>
                </div>
            `;
        }).join('');
        
        detailHtml += `
            <div class="detail-section">
                <div class="detail-label">颜色选项</div>
                <div class="detail-value">
                    <div class="color-options-grid">${colorOptionsHtml}</div>
                </div>
            </div>
        `;
    }
    
    
    // 商品简介
    if (product.description) {
        detailHtml += `
            <div class="detail-section">
                <div class="detail-label">商品简介</div>
                <div class="detail-value">${product.description}</div>
            </div>
        `;
    }
    
    
    
    // 更新详情内容
    productDetail.innerHTML = detailHtml;
    
    
    // 显示详情弹窗
    productDetailOverlay.style.display = 'flex';
}

// 隐藏产品详情
function hideProductDetail() {
    productDetailOverlay.style.display = 'none';
}

// 编辑当前产品
function editCurrentProduct() {
    hideProductDetail();
    showEditForm(currentProductId);
}

// 显示删除确认对话框
function showDeleteConfirm(id) {
    currentProductForDelete = id;
    deleteConfirmOverlay.style.display = 'flex';
}

// 隐藏删除确认对话框
function hideDeleteConfirm() {
    deleteConfirmOverlay.style.display = 'none';
    currentProductForDelete = null;
}

// 删除产品
function deleteProduct() {
    if (currentProductForDelete === null) return;
    
    const index = products.findIndex(p => p.id === currentProductForDelete);
    if (index !== -1) {
        products.splice(index, 1);
        saveProductsToLocalStorage();
        renderProductList();
        renderShopFilters();
    }
    
    hideDeleteConfirm();
}

// 处理搜索
function handleSearch() {
    const id = searchInput.value.trim();
    if (!id) {
        return;
    }

    const baseUrl = 'https://www.tiktok.com/shop/pdp/mens-casual-leather-shoes-by-jinbeishoes-non-slip-sole-breathable-design/';
    const url = baseUrl + id;
    tiktokFrame.src = url;
    if (pasteUrl) {
        pasteUrl.value = url;
    }
}

// 导出数据为JSON文件
function exportDataToJson() {
    // 如果没有产品数据，显示提示
    if (products.length === 0) {
        alert('没有产品数据可导出');
        return;
    }
    
    // 创建要导出的数据对象
    const exportData = {
        version: '2.0',
        exportDate: new Date().toISOString(),
        products: products
    };
    
    // 将数据转换为JSON字符串
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // 创建Blob对象
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `产品数据_${new Date().toISOString().slice(0, 10)}.json`;
    
    // 触发下载
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 0);
    
    // 显示成功消息
    alert('数据导出成功');
}

// 显示导入数据对话框
function showImportDataDialog() {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                // 验证数据格式
                if (!importData.products || !Array.isArray(importData.products)) {
                    alert('导入的文件格式不正确');
                    return;
                }
                
                // 确认导入
                const confirmImport = confirm(`确定要导入 ${importData.products.length} 个产品吗？这将覆盖现有数据。`);
                if (confirmImport) {
                    products = importData.products;
                    saveProductsToLocalStorage();
                    renderProductList();
                    renderShopFilters();
                    alert('数据导入成功');
                }
            } catch (error) {
                alert('导入文件解析失败：' + error.message);
            }
        };
        
        reader.readAsText(file);
    };
    
    // 触发文件选择
    fileInput.click();
}



// 显示剪贴板导入表单
function showPasteImportForm() {
    pasteInput.value = "";
    pasteStatus.style.display = "none";
    pastePreview.style.display = "none";
    confirmPasteImportBtn.style.display = "none";
    parsePasteBtn.style.display = "block";
    pasteUrl.value = tiktokFrame.src || "";
    pasteImportOverlay.style.display = "flex";
}

// 隐藏剪贴板导入表单
function hidePasteImportForm() {
    pasteImportOverlay.style.display = "none";
}

// 通过 URL 加载内容并填充剪贴板输入
function loadPasteUrlContent() {
    const url = pasteUrl.value.trim();
    if (!url) {
        pasteStatus.className = "parse-status error";
        pasteStatus.textContent = "请输入URL";
        pasteStatus.style.display = "block";
        return;
    }

    pasteStatus.className = "parse-status loading";
    pasteStatus.textContent = "正在加载并解析页面...";
    pasteStatus.style.display = "block";

    // 同时在 iframe 中展示页面供查看
    tiktokFrame.src = url;

    fetch(`/proxy?url=${encodeURIComponent(url)}`)
        .then(res => {
            if (!res.ok) throw new Error("加载失败");
            return res.text();
        })
        .then(html => {
            const parsedData = parseHTMLContent(html);
            if (parsedData) {
                pasteStatus.className = "parse-status success";
                pasteStatus.textContent = "成功解析产品数据。";

                pastePreviewContent.innerHTML = "";
                const div = document.createElement("div");
                div.innerHTML = `<strong>${parsedData.name || "未知产品"}</strong> (ID: ${parsedData.productCode || "无"})`;
                pastePreviewContent.appendChild(div);

                pastePreview.style.display = "block";
                confirmPasteImportBtn.style.display = "block";
                parsePasteBtn.style.display = "none";
                window.tempParsedData = [parsedData];
            } else {
                throw new Error("无法解析产品信息");
            }
        })
        .catch(err => {
            pasteStatus.className = "parse-status error";
            pasteStatus.textContent = `加载或解析失败: ${err.message}`;
            pastePreview.style.display = "none";
            confirmPasteImportBtn.style.display = "none";
            parsePasteBtn.style.display = "block";
        });
}

// 解析剪贴板数据
function parsePastedData() {
    const pastedText = pasteInput.value.trim();
    if (!pastedText) {
        pasteStatus.className = "parse-status error";
        pasteStatus.textContent = "请粘贴数据";
        pasteStatus.style.display = "block";
        return;
    }

    try {
        pasteStatus.className = "parse-status loading";
        pasteStatus.textContent = "正在解析数据...";
        pasteStatus.style.display = "block";

        // 尝试解析HTML内容
        const parsedData = parseHTMLContent(pastedText);
        
        if (parsedData) {
            // 显示解析结果预览
            pasteStatus.className = "parse-status success";
            pasteStatus.textContent = "成功解析产品数据。";
            pasteStatus.style.display = "block";

            pastePreviewContent.innerHTML = "";
            const div = document.createElement("div");
            div.innerHTML = `<strong>${parsedData.name || "未知产品"}</strong> (ID: ${parsedData.productCode || "无"})`;
            pastePreviewContent.appendChild(div);
            
            pastePreview.style.display = "block";
            confirmPasteImportBtn.style.display = "block";
            parsePasteBtn.style.display = "none";

            // 临时保存解析后的数据，待确认导入
            window.tempParsedData = [parsedData]; // 包装成数组格式
        } else {
            throw new Error("无法从粘贴的HTML内容中提取产品信息");
        }

    } catch (error) {
        pasteStatus.className = "parse-status error";
        pasteStatus.textContent = `数据解析失败: ${error.message}`; 
        pasteStatus.style.display = "block";
        pastePreview.style.display = "none";
        confirmPasteImportBtn.style.display = "none";
        parsePasteBtn.style.display = "block";
    }
}

// 确认剪贴板导入
function confirmPasteImport() {
    if (window.tempParsedData && Array.isArray(window.tempParsedData)) {
        // 为导入的产品生成唯一ID
        const productsToImport = window.tempParsedData.map(product => ({
            id: generateId(),
            ...product
        }));

        products = [...products, ...productsToImport];
        saveProductsToLocalStorage();
        renderProductList();
        renderShopFilters();
        hidePasteImportForm();
        alert(`成功导入 ${productsToImport.length} 条产品数据！`);
        window.tempParsedData = null; // 清除临时数据
    } else {
        alert("没有可导入的数据。请先解析数据。");
    }
}

// 解析HTML内容，提取基本的商品信息
function parseHTMLContent(htmlContent) {
    try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlContent, 'text/html');

        const productData = {
            name: '',
            productCode: '',
            shopName: '',
            price: '',
            currency: '$',
            description: '',
            colorOptions: []
        };

        const titleEl = doc.querySelector('span.H2-Semibold.text-color-UIText1Display:not(.ml-12)') ||
                         doc.querySelector('[class*="H2-Semibold"][class*="text-color-UIText1Display"]');
        if (titleEl) {
            productData.name = titleEl.textContent.trim();
        }

        const productLink = doc.querySelector('a[href*="tiktok.com/shop/pdp/"]');
        if (productLink) {
            const url = productLink.getAttribute('href');
            const match = url.match(/173\d{16}/);
            if (match) {
                productData.productCode = match[0];
            }
        }

        const shopEl = doc.querySelector('span.H2-Semibold.text-color-UIText1') ||
                        doc.querySelector('[class*="H2-Semibold"][class*="text-color-UIText1"]:not([class*="Display"])');
        if (shopEl) {
            productData.shopName = shopEl.textContent.trim();
        }

        const priceContainer = doc.querySelector('span.flex.flex-row.items-baseline') ||
                               doc.querySelector('[class*="flex"][class*="items-baseline"]');
        if (priceContainer) {
            const currencyEl = priceContainer.querySelector('span[style*="font-size:20px"]');
            const priceEl = priceContainer.querySelector('span[style*="font-size:36px"]');
            const decimalEl = priceContainer.querySelector('span[style*="font-size:20px"]:last-child');

            if (currencyEl) {
                productData.currency = currencyEl.textContent.trim();
            }

            if (priceEl) {
                let price = priceEl.textContent.trim();
                if (decimalEl && decimalEl !== currencyEl) {
                    price += decimalEl.textContent.trim();
                }
                productData.price = price;
            }
        }

        const descEl = doc.querySelector('span.font-sans.font-normal.text-color-UIText1') ||
                        doc.querySelector('[class*="font-sans"][class*="font-normal"][class*="text-color-UIText1"]');
        if (descEl) {
            productData.description = descEl.textContent.trim();
        }

        const colorContainer = doc.querySelector('div.flex.flex-row.overflow-x-auto.gap-12.flex-wrap') ||
                               doc.querySelector('[class*="flex-row"][class*="overflow-x-auto"]');
        if (colorContainer) {
            const items = colorContainer.querySelectorAll('div.flex.flex-col.p-6.rounded-4');
            items.forEach(item => {
                const img = item.querySelector('img');
                const nameSpan = item.querySelector('span.P3-Regular');
                if (nameSpan) {
                    productData.colorOptions.push({
                        name: nameSpan.textContent.trim(),
                        image: img ? img.src : ''
                    });
                }
            });
        }

        if (!productData.name && !productData.shopName && !productData.price) {
            return null;
        }

        return productData;

    } catch (error) {
        console.error('HTML解析错误:', error);
        return null;
    }
}

// 处理二维码拖拽
function handleQrDrop(event) {
    event.preventDefault();
    const target = event.currentTarget;
    target.classList.remove("qr-hover");

    const file = event.dataTransfer.files[0];
    if (!file || !file.type.startsWith("image")) {
        alert("请拖拽一张二维码图片");
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(imageData.data, canvas.width, canvas.height);
            if (code) {
                const match = code.data.match(/17\d+%?/);
                if (match) {
                    const pid = match[0].replace("%", "");
                    target.value = pid;
                    if (target === searchInput) {
                        // Optionally trigger search automatically
                        handleSearch();
                    }
                } else {
                    alert("二维码中没有找到符合条件的产品ID");
                }
            } else {
                alert("未能识别二维码");
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function enableQrDrop(inputElement) {
    inputElement.addEventListener("dragover", function(event) {
        event.preventDefault();
        inputElement.classList.add("qr-hover");
    });
    inputElement.addEventListener("dragleave", function() {
        inputElement.classList.remove("qr-hover");
    });
    inputElement.addEventListener("drop", handleQrDrop);
}

// 复制TikTok商品链接到剪贴板
function copyTiktokProductLink(id) {
    const product = products.find(p => p.id === id);
    if (!product || !product.productCode) {
        alert('该产品没有商品ID');
        return;
    }

    const link = `${TIKTOK_LINK_PREFIX}${product.productCode}${TIKTOK_LINK_SUFFIX}`;
    window.open(link, '_blank');
}

