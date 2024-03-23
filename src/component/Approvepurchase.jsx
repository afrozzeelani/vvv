import React, { useEffect, useState } from 'react';


import { RxCross2 } from "react-icons/rx";
import axios from 'axios';
import { base_Url } from '../pages/api';
import { MdKeyboardArrowRight} from "react-icons/md";
import { MdKeyboardArrowLeft } from "react-icons/md";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { IoCheckmarkOutline } from "react-icons/io5";

import PurchaseNav from './PurchaseNav';
import "./approvePurchase.css"
import { useLocation } from 'react-router-dom';

const Approvepurchase = () => {
    const location = useLocation().pathname;
    const [data, setData] = useState(null);
    const [viewData, setViewData] = useState(data)
    const [current, setCurrent] = useState(1)
    const [searchKeyWord, setSearchKeyWord] = useState("");
    const doc = new jsPDF();
    const allPurchase = async () => {
        try {
            const response = await axios.get(`${base_Url}/product_details/allpurchase`);
            console.log(response)
            console.log(response.data.result)
            setData(response.data.result[0].arr.filter((val)=>{
                return(val.status==="Pending")
            }));
            setViewData(response.data.result[0].arr.filter((val)=>{
                return(val.status==="Pending")
            }));
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        allPurchase();
    }, []);
    
console.log(data)
    const rejectHandler = async (item) => {
        item.status = "Rejected";
        console.log(item)
        try{
            await axios.patch(`${base_Url}/product_details/updateProductstatus/${item._id}`, item);
            alert("Request is Rejected")
            allPurchase();
        }catch(error){
            alert(error)
        }
        

        }
    
    const approveHandler = async (item) => {
        item.status = "Approved";
        console.log(item)
        try{
            await axios.patch(`${base_Url}/product_details/updateProductstatus/${item._id}`, item);
            alert("Request is Approved")
            allPurchase();
        }catch(error){
            alert(error)
        }
      
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
    const pdfSaveHandler = () => {
       if(data.length<1){
        return;
       }
        if (data && Array.isArray(data)) {
          
            doc.setFontSize(10);
            doc.text("Approve Supplier Data", 5, 5);
            
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
                startY: 8, // Adjust startY based on the heading's height
                startX: 5,
                margin: { left: 5, right: 5 },
                tableWidth: 'auto',
                styles: { cellPadding: 2, fontSize: 8, valign: 'middle', halign: 'center' },
                headStyles: { fillColor: [15, 96, 96], textColor: 255, fontSize: 8, fontStyle: 'bold', minCellHeight: 10 },
                bodyStyles: { minCellHeight: 8, alternateRowStyles: { fillColor: [255, 204, 153] } },
            });
    
            doc.save('Purchase Waiting for Approval.pdf');
        }
    };
    const paginationPrevHandler =(page)=>{
        
        if(page<1) return;
      setCurrent(page);
    }
    const paginationNextHandler = (page)=>{
        if(page*10-9>data.length) return;
        setCurrent(page);
    }
  return (
   <>
                
                <div className='purchase'>
                <PurchaseNav location={location}   pdfSaveHandler={pdfSaveHandler} searchKeyWord={searchKeyWord} searchHandler={searchHandler}/>
                <div className='purchase-table'>
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
                                        <td className='pending'>{val.status }</td>
                                       
                                       <td className='purchasde-icon'><IoCheckmarkOutline className='approved' onClick={() => approveHandler(val)} /> <RxCross2 className='rejected' onClick={() => rejectHandler(val)} /></td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                </div>
                {viewData?.length>10 &&  <div className='managersuplier-pagination'>
                      
                      <MdKeyboardArrowLeft onClick={() => paginationPrevHandler(current - 1)}/>
                      <li>{current}</li>
                      <MdKeyboardArrowRight onClick={()=>paginationNextHandler(current+1)}/>
                 
              </div>}
                </>
  )
}

export default Approvepurchase
