import React, {useEffect, useState} from 'react';
import { IoCloseOutline } from "react-icons/io5";
import { base_Url } from '../pages/api';
import { v4 as uuidv4 } from 'uuid';
import "./purchaseForm.css"
import { RiDeleteBinLine } from "react-icons/ri";
import axios from 'axios';

const PurchaseForm = ({setFormToggle,allPurchase, todayBatch, purchase }) => {
let rray = purchase[0].purchase_no.split("-")[1];

let purchaseNo = `KASP-${+rray+1}`;
console.log(purchaseNo)

const generate = uuidv4();
const currentDate = new Date();
 
    const formattedDate = currentDate.toISOString().split('T')[0];
    let batchNo = `${formattedDate}-${todayBatch.length+1}`;
  const [data, setData] = useState({
    id: generate,
    date:formattedDate,
    purchase_no: purchaseNo,
    batchNo,
    product_Name: "",
    suplire_Email : "",
    supplierDetail: "",
    category_name: "",
    hsn: "",
    taxName: "",
    taxPer:"",
    noOfUnit: "",
    perUnitPrice: "",
    totalPrice: 0,
    status: "Pending"
});
useEffect(()=>{
  let arr = [];
  console.log(arr)
  localStorage.setItem("purchase", JSON.stringify(arr));
},[])


const [supplierDetails, setSupplierDetails] = useState("");
const [categoryDetails, setCategoryDetails] = useState("");
const [productDetails, setProductDetails] = useState("");
const [supplierData, setSupplierData] = useState("");


const [product, setProduct] = useState("");
const addListHandler =()=>{
  if( data.date &&
    data.purchase_no &&
    data.product_Name &&
    data.suplire_Email &&
    data.noOfUnit &&
    data.hsn && 
    data.perUnitPrice &&
    
    data.category_name){
  let arr = JSON.parse(localStorage.getItem("purchase"));
  arr.push(data);
  localStorage.setItem("purchase", JSON.stringify(arr));
  setData(
    {
      id: generate,
      date: data.date,
      purchase_no: data.purchase_no,
      product_Name: "",
      suplire_Email : data.suplire_Email,
      supplierDetail: data.supplierDetail,
      batchNo:  `${formattedDate}-${++data.batchNo.split("-")[3]}`,
      category_name: "",
      noOfUnit: "",
      hsn: "",
      taxName: "",
      taxPer:"",
      perUnitPrice: "",
      totalPrice: 0,
      status: "Pending"
  }
  )
}else {
  if (!data.date) {
    alert('Please select date');
  } else if (!data.purchase_no) {
    alert('Please enter the purchase no.');
  } else if (!data.suplire_Email) {
    alert('Please enter a Supplier Name');
  }else if (!data.category_name) {
    alert('Please enter the category Name');
  }else if(!data.product_Name){
    alert('Please enter a Product Name');
  } else if (!data.noOfUnit) {
    alert('Please enter no. of unit');
  }else if (!data.perUnitPrice) {
    alert('Please enter the per unit price');
  }
} 
}


const purchaseFormHandler=async ()=>{
  try{
    let arr = JSON.parse(localStorage.getItem("purchase"));
    console.log(arr)

        const response = await axios.post(`${base_Url}/product_details/product`, arr);
        console.log(response);
        alert("purchase Request done Successfully");
        setFormToggle(false);
        allPurchase();
        localStorage.removeItem("purchase");
      
  
   
    
  }catch(error){
    alert(error.response.data.message)
  }
 
}

const supplierDetailsHandler = async()=>{
   
  try{
    const response = await   axios.get(`${base_Url}/product/category_Supplire`);


    setSupplierDetails(response.data.suppliers);
 
    console.log(response.data.suppliers)
  }catch(error){
      console.log(error)
  }
}
const categoryDetailsHandler = async(mail)=>{
  console.log(mail)
 

  try{
  
    const response = await axios.post(`${base_Url}/product_details/category`, {suplierEmail: mail});
 setCategoryDetails(response.data.result)
 let supplierInfo= supplierData.filter((val)=>{
  return val.suplierEmail=== mail;
});
 setData((prev)=>({...prev, supplierDetail: supplierInfo }));
console.log(supplierInfo)
  }catch(error){
    console.log(error)
  }
}

const productDetailsHandler = async ()=>{
  try{
    const response = await axios.post(`${base_Url}/product_details/productsDetails`, data);
    setProduct(response.data.product)
    setProductDetails(response.data.result)

  }catch(error){
    console.log(error)

  }
 
}
const allSupplier = async () => {
  try {
      const response = await axios.get(`${base_Url}/supplier/find_supplire`);
 
      setSupplierData(response.data.product)
  } catch (error) {
      console.log(error);
  }
}

const calculateTotalPrice = () => {
  const price = (+data.noOfUnit * +data.perUnitPrice);
  let totalPrice = price;

  if (data.taxPer !== "") {
    const taxAmount = Math.floor(price * (+data.taxPer) / 100);
    totalPrice += taxAmount;
  }

  setData(prev => ({ ...prev, totalPrice }));
};

useEffect(() => {
  calculateTotalPrice();
}, [data.perUnitPrice, data.noOfUnit, data.product_Name]);
useEffect(()=>{
  supplierDetailsHandler();
  allSupplier();
},[])

const purchaseHandler = ()=>{
  let arr = JSON.parse(localStorage.getItem("purchase"));


  if (
   arr.length>0
  ) {
   console.log(arr)
    purchaseFormHandler();

    
    setData({
      id: "",
      date: formattedDate,
      purchase_no: "",
      product_Name: "",
      suplire_Email : "",
      category_name: "",
      noOfUnit: "",
      hsn: "",
      taxName: "",
      taxPer: "",
      batchNo:  `${formattedDate}-${++data.batchNo.split("-")[3]}`,
      perUnitPrice: "",
      totalPrice: 0,
      supplierDetail: "",
      status: "pending"
  })
  } 
}

const deleteHandler=(index)=>{
  let arr = JSON.parse(localStorage.getItem("purchase"));
  arr.splice(index, 1);
  localStorage.setItem("purchase", JSON.stringify(arr));
  setData(
    {
      id: generate,
      date: data.date,
      purchase_no: data.purchase_no,
      product_Name: "",
      suplire_Email : data.suplire_Email,
      supplierDetail: data.supplierDetail,
      batchNo:  `${formattedDate}-${--data.batchNo.split("-")[3]}`,
      category_name: "",
      noOfUnit: "",
      hsn: "",
      taxName: "",
      taxPer:"",
      perUnitPrice: "",
      totalPrice: 0,
      status: "pending"
  }
  )
}

const productHandler = (e)=>{
  console.log(product)
  let filterProduct = product.filter((val)=>{
    return val.product_Name===e.target.value
  })
  console.log(filterProduct)
  setData({...data, taxName:filterProduct[0].taxName, product_Name:e.target.value, hsn: filterProduct[0].hsn, taxPer:filterProduct[0].taxPer});

}

let arr = JSON.parse(localStorage.getItem("purchase"));
console.log(data)
  return (
   
      <div className='purchase_form-container'>
         <div className='purchase_form'>
           <div className='suplierform-heading'>
                <h4>Add  Product</h4>
                <div className='suplierform-closing'>
                    <IoCloseOutline onClick={()=>{setFormToggle(false); }}/>
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
            <label htmlFor='Purchase'>Purchase No.</label>
            <input type='text' id='Purchase' placeholder='Purchase No.' disabled value={data.purchase_no} />
            <label htmlFor='supplierName'>Supplier Email</label>
           
           <select id='supplierName' value={data.suplire_Email}  disabled = {arr && arr.length ?true: false}  onChange={(e)=>setData((prev)=>({...prev, suplire_Email:e.target.value}))} onBlur={(e)=>categoryDetailsHandler(e.target.value)}>
              <option value="" disabled>Supplier Name</option>
              {supplierDetails && supplierDetails.map((val, i)=>{
                    return(<option key={val._id} value={val}>{val}</option>)
                   
                  })}
              
            </select>
            <label htmlFor='categoryName'>Category Name</label>
            <select id='categoryName' value={data.category_name} onChange={(e)=>setData((prev)=>({...prev, category_name:e.target.value}))} onBlur={productDetailsHandler}>
              <option value="" disabled>Category Name</option>
              {categoryDetails && categoryDetails.map((val,i)=>{
                return(<option key={i} value={val}>{val}</option>)
               
              })}
              
            </select>
           
            <label htmlFor="productName">Product Name</label>
            <select id='productName' value={data.product_Name} onChange={(e)=>productHandler(e)}>
              <option value="" disabled>Product Name</option>
              {productDetails && productDetails.map((val,i)=>{
                return(<option key={i} value={val}>{val}</option>)
              })}
              
            </select>
            <label htmlFor='hsnName'>Hsn Name</label>
            <input type='number' id='hsnName' value={data.hsn} disabled placeholder='Hsn'/>
            <label htmlFor='noOfUnit'>No of Unit</label>
            <input type='number' placeholder='No of Unit' id='noOfUnit' value={data.noOfUnit} onChange={(e) => {setData((prev) => ({ ...prev, noOfUnit: e.target.value, totalPrice: e.target.value * data.perUnitPrice }))}} />
            <label htmlFor='UnitPerPrice'>unit Per Price</label>
            <input type='number' placeholder='unit per Price' id='UnitPerPrice'  value={data.perUnitPrice} onChange={(e) => {setData((prev) => ({ ...prev, perUnitPrice: e.target.value, totalPrice: data.noOfUnit * e.target.value }))}} />
            <label htmlFor="tax">Tax</label>
            <input type='text' id='tax' value={data.taxName} disabled placeholder='Tax'/>

            <label htmlFor='totalPrice'>Total Price</label>
            <input type='number' placeholder='Total Price' disabled id='totalPrice' value={data.totalPrice} />
           </div>
           <button type='button' onClick={addListHandler}>add</button>
          
           
           <div className='managersuplier-table'>
                    <table>
                        <thead>
                            <tr>
                            <th style={{ width: '20px' }}>S No.</th>
                                <th style={{ width: '20px' }}>Purchase No.</th>
                                <th style={{ width: '100px' }}>Date</th>
                                <th style={{ width: '150px' }}>Supplier Name </th>
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
                                        <td>{val.suplire_Email}</td>
                                        <td>{val.category_name }</td>
                                        <td>{val.noOfUnit }</td>
                                        <td>{val.product_Name }</td>
                                        <td><b>{(val.status).toUpperCase()}</b></td>
                                       
                                       {val.status==="Pending" || val.status==="Rejected"?<td><RiDeleteBinLine className='reject' onClick={() => deleteHandler(i)} /></td>: <td></td>}
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                 <button type='button' onClick={purchaseHandler}>Purchase</button>
         </div>
        
    </div>
  )
}

export default PurchaseForm
