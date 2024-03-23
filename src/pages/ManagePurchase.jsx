import React, { useEffect, useState } from 'react';
import "./managersuplier.css";
import axios from 'axios';
import { base_Url } from './api';
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import PurchaseForm from '../component/PurchaseForm';
import PurchaseBill from "../component/PurchaseBill"
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

import { useAsyncError, useLocation } from 'react-router-dom';
import { TfiTrash } from "react-icons/tfi";
import { SlEye } from "react-icons/sl";
import PurchaseNav from '../component/PurchaseNav';

const ManagePurchase = () => {
    const location  = useLocation().pathname;
    const [formToggle, setFormToggle] = useState(false);
    const [viewToggle, setViewToggle] = useState(false);
    const [viewPurchase, setViewPurchase] = useState(false)
    const [data, setData] = useState(null);
    const [viewData, setViewData] = useState(data);
    const [current, setCurrent] = useState(1)
    const [searchKeyWord, setSearchKeyWord] = useState("");
    const [editData, setEditData] = useState("");
    const [todayBatch, setTodayBatch] =useState([])
    const doc = new jsPDF();
    const allPurchase = async () => {
        try {
            const response = await axios.get(`${base_Url}/product_details/allpurchase`);
            console.log(response.data.result)
            setData(response.data.result[0].arr);
            setViewData(response.data.result[0].arr)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        allPurchase();
    }, []);
    
    const pdfSaveHandler = () => {
        console.log("hello");
        if (data && Array.isArray(data)) {
          
            doc.setFontSize(10);
            doc.text("Supplier Data", 5, 5);
            
            const headers = [
                ["No.", 'Date', 'Purchase_no', "Product_Name", 'Suplire_Email', 'Hsn', "Unit Cost", "QTY", "Tax Name", "Total Price"]
            ];
            const body = data.map((item, i) => [
                i + 1,
                item.date,
                item.purchase_no,
                item.product_Name,
                item.suplire_Email,
                item.hsn,
                item.perUnitPrice,
                item.noOfUnit,
                item.taxName,
                item.totalPrice,
            ]);
    
            autoTable(doc, {
                head: headers,
                body: body,
                startY: 8,
                startX: 5,
                margin: { left: 5, right: 5 },
                tableWidth: 'auto',
                styles: { cellPadding: 2, fontSize: 8, valign: 'middle', halign: 'center' },
                headStyles: { fillColor: [15, 96, 96], textColor: 255, fontSize: 8, fontStyle: 'bold', minCellHeight: 10 },
                bodyStyles: { minCellHeight: 8, alternateRowStyles: { fillColor: [255, 204, 153] } },
            });
    
            doc.save('Purchase.pdf');
        }
    };
    
    const deleteHandler = async (id) => {
        await axios.delete(`${base_Url}/product_details/remove_product_details/${id}`).then((res) => {
            console.log(res.data);
            alert("deleted")
            allPurchase();

        }).catch((err) => console.log(err))
    }

    const searchHandler = (e) => {
        console.log(e.target.value)
        if (e.target.value.length>0) {
            const filterData = data.filter((val) => {
                return val.purchase_no.includes(e.target.value);
            });
            setViewData(filterData);
        }else if(e.target.value.length===0){
            setViewData(data);
        }
        setSearchKeyWord(e.target.value)
    }
    const paginationPrevHandler =(page)=>{
        
        if(page<1) return;
      setCurrent(page);
    }
    const paginationNextHandler = (page)=>{
        if(page*10-9>data.length) return;
        setCurrent(page);
    }
 
    const todaysUnitHandler = ()=>{
        const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
 
   let   todayBatch = data.filter((item)=>{
        return item.date===formattedDate
    });
    setTodayBatch(todayBatch);       
    }

    return (
        <> {viewToggle ? <PurchaseBill  viewPurchase={viewPurchase} setViewToggle={setViewToggle} /> : <></>}
        {formToggle ? <PurchaseForm todayBatch={todayBatch} purchase={data} allPurchase={allPurchase} setFormToggle={setFormToggle} /> : <></>}
    
        <div className='purchase'>
         <PurchaseNav location={location} pdfSaveHandler={pdfSaveHandler} searchKeyWord={searchKeyWord} searchHandler={searchHandler}/>
    <div className='purchase-table'>
        <button className='newPurchase' onClick={()=>(setFormToggle(true), todaysUnitHandler())}>New Purchase</button>
        <table>
            <thead>
              
                <tr>
                    <th>S No.</th>
                    <th>ID</th>
                    <th>Date</th>
                    <th>Batch No</th>
                    <th>Name</th>
                    <th>Supplier Email</th>
                    <th>QTY</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Action</th>
                </tr>
            </thead>
            <tbody>
            {
            viewData && viewData.slice(current*10-10, current*10).map((val, i) => (
              <tr key={val.id}>
                  <td>{(current-1)*10 +i + 1}</td>
                  <td>{val.purchase_no}</td>
                  <td>{val.date}</td>
                  <td>{val.batchNo}</td>
                  <td>{val.product_Name }</td>
                  <td>{val.suplire_Email}</td>
                  <td>{val.noOfUnit }</td>
                  <td>{val.totalPrice }</td>
                  <td className={val.status==="Approved"?"approve":val.status==="Pending"?"pending":"reject"}>{val.status}</td>
                  {val.status==="Pending" || val.status==="Rejected"?<td><TfiTrash className='reject' onClick={() => deleteHandler(val.id)}/></td>:<td><SlEye className='visible' onClick={()=>(setViewPurchase(val.purchase_no),setViewToggle(true))}/></td>}
                </tr>))}
            </tbody>
        </table>
    </div>
    {viewData?.length>10 &&  <div className='managersuplier-pagination'>
                      
                            <MdKeyboardArrowLeft onClick={() => paginationPrevHandler(current - 1)}/>
                            <li>{current}</li>
                            <MdKeyboardArrowRight onClick={()=>paginationNextHandler(current+1)}/>
                       
                    </div>}
        </div>
        </>
    );
}

export default ManagePurchase
