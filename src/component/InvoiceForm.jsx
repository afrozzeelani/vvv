import React, { useEffect, useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';
import { RiDeleteBinLine } from 'react-icons/ri';
import { base_Url } from '../pages/api';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import './purchaseForm.css';

const InvoiceForm = ({ setFormToggle, allPurchase, invoice }) => {
  let rray = invoice[0].purchase_no.split("-")[1];

let purchaseNo = `KASP-${+rray+1}`;
  console.log(purchaseNo)
  const generate = uuidv4();
  const [allCustomers, setAllCustomers] = useState(null);
  const [hsnDetails, setHsnDetails] = useState("");
  const [tax, setTax] = useState(null);
  const [product, setProduct] = useState("");
    const currentDate = new Date();
 
    const formattedDate = currentDate.toISOString().split('T')[0];
  

 
  const [data, setData] = useState({
    id: generate,
    date: formattedDate,
    purchase_no: purchaseNo,
    product_Name: '',
    category_name: '',
    noOfUnit: '',
    perUnitPrice: '',
    discount: 0,
    totalPrice: 0,
    status: 'Pending',
    paidStatus: '',
    hsn: '',
    taxName: '',
    paidAmount: 0,
    dueAmount: 0,
    customer_email: '',
    customer_detail: '',
  });

  const [categoryDetails, setCategoryDetails] = useState('');
  const [productDetails, setProductDetails] = useState('');
  const [filteredProducts, setFilteredProducts] = useState([]);
  const purchaseFormHandler = async () => {
    try {
      let arr = JSON.parse(localStorage.getItem('purchase'));
      const response = await axios.post(`${base_Url}/invoice/invoices`, arr);
      alert('Purchase Request done Successfully');
      setFormToggle(false);
      allPurchase();
      localStorage.removeItem('purchase');
    } catch (error) {
      console.log(error.response.data.message);
      alert(error.response.data.message);
    }
  };

  const allCategory = async () => {
    try {
      const response = await axios.get(`${base_Url}/category/findall_category`);
      setCategoryDetails(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };
  const filterProducts = (value) => {
    if (value.trim() === '') {
      setFilteredProducts([]);
      return;
    }
    const filtered = productDetails.filter((product) =>
      product.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredProducts(filtered.slice(0, 10)); // Limiting to first 10 filtered products
  };
  const productDetailsHandler = async () => {
    try {
      const response = await axios.post(`${base_Url}/invoice/invoicesDetails`, data);
      setProduct(response.data.product);
      setProductDetails(response.data.result);
    } catch (error) {
      console.log(error);
    }
  };

  const allTax = async () => {
    try {
      const response = await axios.get(`${base_Url}/tax/find_tax`);
      setTax(response.data.product);
    } catch (error) {
      console.log(error);
    }
  };

  const hsnDetailsHandler = async () => {
    try {
      const response = await axios.get(`${base_Url}/hsn/findall_hsn`, data);
      setHsnDetails(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const allClient = async () => {
    try {
      const response = await axios.get(`${base_Url}/client/allCustomer`);
      setAllCustomers(response.data.result);
    } catch (error) {
      console.log('hello');
    }
  };

  useEffect(() => {
    let arr = [];
    localStorage.setItem('purchase', JSON.stringify(arr));
  }, []);

  useEffect(() => {
    allCategory();
    allClient();
    allTax();
    hsnDetailsHandler();
  }, []);

  useEffect(() => {
    if (data.paidStatus === 'paid') {
      setData((prev) => ({ ...prev, paidAmount: data.totalPrice, dueAmount: 0 }));
    } else if (data.paidStatus === 'unpaid') {
      setData((prev) => ({ ...prev, paidAmount: 0, dueAmount: data.totalPrice }));
    } else if (data.paidStatus === 'partiallyPaid') {
      setData((prev) => ({ ...prev, dueAmount: data.totalPrice - data.paidAmount }));
    }
  }, [data.paidStatus, data.paidAmount]);

  useEffect(() => {
    const calculateTotalPrice = () => {
      console.log(data);
      let price = +data.noOfUnit * +data.perUnitPrice - +data.discount;
      if(tax){
        const taxDetail = tax.find(item => item.taxName === data.taxName);
        if(taxDetail){
          let  totalPrice= Math.floor(+price + (+price * +taxDetail.taxPer) / 100);
          setData((prev) => ({
            ...prev,
            totalPrice,
          }));
        }
      }
     
  
    
    };
  
    calculateTotalPrice();
  }, [data.noOfUnit, data.perUnitPrice, data.discount, data.taxName]);
  

  const addListHandler = () => {
    if (
      data.date &&
      data.purchase_no &&
      data.product_Name &&
      data.noOfUnit &&
      data.customer_email &&
      data.paidStatus &&
      data.perUnitPrice &&
      data.category_name
    ) {
      let arr = JSON.parse(localStorage.getItem('purchase'));
      arr.push(data);
      localStorage.setItem('purchase', JSON.stringify(arr));
      setData((prev) => ({
        ...prev,
        id: generate,
        date: data.date,
        purchase_no: data.purchase_no,
        product_Name: '',
        category_name: '',
        noOfUnit: '',
        perUnitPrice: '',
        totalPrice: 0,
        discount: 0,
        status: 'Pending',
        paidStatus: '',
        hsn: '',
        taxName: '',
        paidAmount: 0,
        dueAmount: 0,
        customer_email: data.customer_email,
        customer_detail: data.customer_detail,
      }));
    } else {
      if (!data.date) {
        alert('Please select date');
      } else if (!data.purchase_no) {
        alert('Please enter the purchase no.');
      } else if (!data.category_name) {
        alert('Please enter the category Name');
      } else if (!data.product_Name) {
        alert('Please enter a Product Name');
      } else if (!data.noOfUnit) {
        alert('Please enter no. of unit');
      } else if (!data.customer_email) {
        alert('Please enter a Customer Name');
      } else if (!data.perUnitPrice) {
        alert('Please enter the per unit price');
      } else if (!data.paidStatus) {
        alert('Select payment status');
      }
    }
  };

  const blurHandler = (mail) => {
    let clientInfo = allCustomers.filter((val) => {
      return val.customer_email === mail;
    });

    setData((prev) => ({ ...prev, customer_detail: clientInfo }));
  };

  const taxHandler = (val) => {
    const detail = tax.find((item) => {
      return val === item.taxName;
    });

    let price = +data.noOfUnit * +data.perUnitPrice - +data.discount;
    setData((prev) => ({
      ...prev,
      totalPrice: Math.floor(price + (price * +detail.taxPer) / 100),
    }));
  };

  const deleteHandler = (index) => {
    let arr = JSON.parse(localStorage.getItem('purchase'));
    arr.splice(index, 1);
    localStorage.setItem('purchase', JSON.stringify(arr));
    setData((prev) => ({
      ...prev,
      id: generate,
      date: data.date,
      purchase_no: data.purchase_no,
      product_Name: '',
      category_name: '',
      noOfUnit: '',
      perUnitPrice: '',
      totalPrice: 0,
      discount: 0,
      status: 'Pending',
      paidStatus: '',
      hsn: '',
      taxName: '',
      paidAmount: 0,
      dueAmount: 0,
      customer_email: data.customer_email,
      customer_detail: data.customer_detail,
    }));
  };

  const purchaseHandler = () => {
    let arr = JSON.parse(localStorage.getItem('purchase'));

    if (arr.length > 0) {
      purchaseFormHandler();
      setData({
        id: generate,
        date: formattedDate,
        purchase_no: '',
        product_Name: '',
        category_name: '',
        noOfUnit: '',
        perUnitPrice: '',
        totalPrice: 0,
        discount: 0,
        status: 'Pending',
        taxName: '',
        paidStatus: '',
        hsn: '',
        paidAmount: 0,
        dueAmount: 0,
        customer_email: '',
        customer_detail: '',
      });
    }
  };

  let arr = JSON.parse(localStorage.getItem('purchase'));
  const productHandler = (e)=>{
    console.log(product)
    let filterProduct = product.filter((val)=>{
      return val.product_Name===e.target.value
    })
    console.log(filterProduct)
    setData({...data, taxName:filterProduct[0].taxName, product_Name:e.target.value, hsn: filterProduct[0].hsn, taxPer:filterProduct[0].taxPer});
  
  }
  return (
    <div className='purchase_form-container'>
      <div className='purchase_form'>
        <div className='suplierform-heading'>
          <h4>Add  Invoice</h4>
          <div className='suplierform-closing'>
            <IoCloseOutline onClick={() => {setFormToggle(false); }} />
          </div>
        </div>
        <div className='purchase-form-inputs_container'>
        <label htmlFor='date'>Date</label>
<input 
  type='text' 
  id='date' 
  disabled 
  value={formattedDate} 

/>
          <label htmlFor='Purchase'>Invoice No.</label>
          <input type='text' id='Purchase' placeholder='Invoice No.' disabled value={data.purchase_no} />


          <label htmlFor='categoryName'>Category Name</label>
          <select id='categoryName' value={data.category_name}  onChange={(e) => setData((prev) => ({ ...prev, category_name: e.target.value }))} onBlur={productDetailsHandler}>
            <option value="" disabled>Category Name</option>
            {categoryDetails && categoryDetails.map((val, i) => {
              return (<option key={i} value={val.category}>{val.category}</option>)

            })}

          </select>
          <label htmlFor="productName">Product Name</label>
          <select id='productName' value={data.product_Name}  onChange={(e)=>productHandler(e)}>
            <option value="" disabled>Product Name</option>
            {productDetails && productDetails.map((val, i) => {
              return (<option key={i} value={val}>{val}</option>)
            })}

          </select>
            <label htmlFor='customerEmail'>Customer Email</label>
          <select id='customerEmail' value={data.customer_email} disabled={arr && arr.length>0? true:false} onChange={(e) =>  setData((prev) => ({ ...prev, customer_email: e.target.value }))} onBlur={(e)=>blurHandler(e.target.value)} >
            <option value="" disabled>Customer Email</option>
            {allCustomers && allCustomers.map((val, i) => {
              return (<option key={i} value={val.customer_email} >{val.customer_email}</option>)

            })}

          </select>
          <label htmlFor='noOfUnit'>No of Unit</label>
          <input type='number' placeholder='No of Unit' id='noOfUnit' value={data.noOfUnit} onChange={(e) => { setData((prev) => ({ ...prev, noOfUnit: e.target.value, totalPrice: +e.target.value * +data.perUnitPrice })) }} />
          <label htmlFor='UnitPerPrice'>unit Per Price</label>
          <input type='number' placeholder='unit per Price' id='UnitPerPrice' value={data.perUnitPrice} onChange={(e) => { setData((prev) => ({ ...prev, perUnitPrice: e.target.value, totalPrice: +data.noOfUnit * +e.target.value })) }} />
          <label htmlFor='UnitPerPrice'>Discount</label>
          <input type='number' placeholder='Discount' id='UnitPerPrice' value={data.discount} onChange={(e) => { setData((prev) => ({ ...prev, discount: e.target.value, totalPrice: (+data.noOfUnit * +data.perUnitPrice) - +e.target.value })) }} />
          <label htmlFor="tax">Tax</label>
          <input id='tax' value={data.taxName} placeholder='tax' disabled/>
          <label htmlFor='totalPrice'>Total Price</label>
          <input type='number' placeholder='Total Price' disabled id='totalPrice' value={data.totalPrice} />
          <label htmlFor='paidStatus'>Paid Status</label>
          <select id='paidStatus' value={data.paidStatus} onChange={(e) => setData((prev) => ({ ...prev, paidStatus: e.target.value}))}>
          <option value="" disabled>Paid Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">UnPaid</option>
            <option value="partiallyPaid">Partially Paid</option>
          </select>
          <label htmlFor='paidAmount'>Paid Amount</label>
          <input type='number' placeholder='paidAmount' id='paidAmount' disabled={data.paidStatus === "paid" || data.paidStatus === "unpaid" ? true : false} value={data.paidStatus === "paid" ? data.totalPrice :
            data.paidStatus === "unpaid" ? 0:
              data.paidStatus === "partiallyPaid" ? (data.paidAmount):(data.paidAmount)} onChange={(e) => { setData((prev) => ({ ...prev, paidAmount: e.target.value})) }} />
          <label htmlFor='dueAmount'>Due Amount</label>
          <input
            type='number'
            placeholder='Due Amount'
            id='dueAmount'
            value={
              data.paidStatus === "paid" ? 0 :
                data.paidStatus === "unpaid" ? data.totalPrice :
                  data.paidStatus === "partiallyPaid" ? (data.totalPrice - +data.paidAmount) :
                    ""
            }
            disabled={true}
            onChange={(e) => {
              setData((prev) => ({ ...prev, dueAmount: e.target.value }))
            }}
            
          />
           <label htmlFor='hsnName'>Hsn Name</label>
            <input id='hsnName' value={data.hsn} placeholder='hsn' disabled/>
              
              
            
          
        </div>
        <button type='button' onClick={addListHandler}>Add </button>
        <div className='managersuplier-table'>
                    <table>
                        <thead>
                            <tr>
                            <th style={{ width: '20px' }}>S No.</th>
                                <th style={{ width: '20px' }}>Invoice No.</th>
                                <th style={{ width: '100px' }}>Date</th>
                                <th style={{ width: '150px' }}>Customer Email</th>
                                <th style={{ width: '80px' }}>category</th>
                                <th style={{ width: '50px' }}>QTY</th>
                                <th style={{ width: '130px' }}>Product Name</th>
                                <th style={{ width: '100px' }}>Status</th>
                                <th style={{ width: '80px' }}>Action</th>



                            </tr>
                        </thead>
                        <tbody>
                            {
                              arr && arr.map((val, i) => (
                                    <tr key={i}>
                                        <td>{i + 1}</td>
                                        <td>{val.purchase_no}</td>
                                        <td>{val.date}</td>
                                        <td>{val.customer_email}</td>
                                        <td>{val.category_name }</td>
                                        <td>{val.noOfUnit }</td>
                                        <td>{val.product_Name }</td>
                                        <td><b>{(val.status).toUpperCase()}</b></td>
                                       
                                       {val.status==="Pending" || val.status==="Rejected"? <td><RiDeleteBinLine onClick={() => deleteHandler(i)} /></td>:<td></td>}
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
        
        <button type='button' onClick={purchaseHandler}>Checkout</button>

      </div>
    </div>
  )
}

export default InvoiceForm;




