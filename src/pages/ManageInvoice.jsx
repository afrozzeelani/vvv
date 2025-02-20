import React, { useEffect, useState } from 'react';
import "./managersuplier.css";
import { RiDeleteBinLine } from "react-icons/ri";
import axios from 'axios';
import { base_Url } from './api';
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import InvoiceForm from '../component/InvoiceForm';
import Invoice from '../component/Invoice';
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import InvoiceNav from '../component/InvoiceNav';
import { useLocation } from 'react-router-dom';
const ManageInvoice = () => {
    const location = useLocation().pathname;
    const [formToggle, setFormToggle] = useState(false);
    const [viewToggle, setViewToggle] = useState(false);
    const [todayBatch, setTodayBatch] =useState([])
    const [data, setData] = useState(null);
    const [veiwData, setViewData] = useState(data);
    const [current, setCurrent] = useState(1)
    const [searchKeyWord, setSearchKeyWord] = useState("");
    const [viewPurchase, setViewPurchase] = useState(null);
    const doc = new jsPDF({orientation: 'landscape'});
    const allPurchase = async () => {
        try {
            const response = await axios.get(`${base_Url}/invoice/allInvoices`);
          
            setViewData(response.data.result[0].arr)
            setData(response.data.result[0].arr);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        allPurchase();
    }, []);
    
console.log(data)
    const deleteHandler = async (id) => {
        await axios.delete(`${base_Url}/invoice/remove_invoice_details/${id}`).then((res) => {
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
    const pdfSaveHandler = () => {
    
        if (data && Array.isArray(data)) {
           
            doc.setFontSize(10);
            doc.text("Invoices Data", 5, 5);
            
            const headers = [
                ["No.", 'Date', 'Purchase_no', "Product_Name", 'Cutomer_Email', 'Hsn', "Unit Cost", "QTY", "discount", "Tax Name", "Total Price","Paid Amount", "Due Amount", "Paid Status"]
            ];
            const body = data.map((item, i) => [
                i + 1,
                item.date,
                item.purchase_no,
                item.product_Name,
                item.customer_email,
                item.hsn,
                item.perUnitPrice,
                item.noOfUnit,
                item.discount,
                item.taxName,
                item.totalPrice,
                item.paidAmount,
                item.dueAmount,
                item.paidStatus,
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
                bodyStyles: { minCellHeight: 10, alternateRowStyles: { fillColor: [255, 204, 153] } },
            });
    
            doc.save('Invoice.pdf');
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
    const todaysUnitHandler = ()=>{
        const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
 
   let   todayBatch = data.filter((item)=>{
        return item.date===formattedDate
    });
    setTodayBatch(todayBatch);       
    }

    return (
        <>  
        {viewToggle ? <Invoice  viewPurchase={viewPurchase} setViewToggle={setViewToggle} /> : <></>}
            {formToggle ? <InvoiceForm invoice={data}  todayBatch= {todayBatch} allPurchase={allPurchase} setFormToggle={setFormToggle} /> : <></>}
            <div className='purchase'>
               <InvoiceNav location={location} pdfSaveHandler={pdfSaveHandler} searchKeyWord={searchKeyWord} searchHandler={searchHandler}/>
                <div className='purchase-table'>
                <button className='newPurchase' onClick={()=>(setFormToggle(true), todaysUnitHandler())}>New Invoice</button>
                    <table>
                        <thead>
                            <tr>
                            <th>S No.</th>
                                <th>ID</th>
                                <th>Date</th>
                                <th >Product Name </th>
                                <th >category</th>
                                <th >QTY</th>
                                <th >Total Price</th>
                                <th>Paid status</th>
                                <th>Due</th>
                                <th>Paid</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                veiwData && veiwData.slice(current*10-10, current*10).map((val, i) => (
                                    <tr key={val.id}>
                                        <td>{(current-1)*10 +i + 1}</td>
                                        <td>{val.purchase_no}</td>
                                        <td>{val.date}</td>
                                        <td>{val.product_Name }</td>
                                        <td>{val.category_name }</td>
                                        <td>{val.noOfUnit}</td>
                                        <td>{val.totalPrice }</td>
                                        <td>{val.paidStatus}</td>
                                        <td>{val.dueAmount}</td>
                                        <td>{val.paidAmount}</td>

                                        
                                        <td className={val.status==="Approved"?"approve":val.status==="Pending"?"pending":"reject"}>{val.status}</td>
                                       
                                       {val.status==="Pending" || val.status==="Rejected"? <td><RiDeleteBinLine className='reject' onClick={() => deleteHandler(val.id)} /></td>:<td><MdOutlineRemoveRedEye className='visible' onClick={()=> (setViewPurchase(val.purchase_no),setViewToggle(true))}/></td>}
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
                {veiwData?.length>10 &&  <div className='managersuplier-pagination'>
                      
                      <MdKeyboardArrowLeft onClick={() => paginationPrevHandler(current - 1)}/>
                      <li>{current}</li>
                      <MdKeyboardArrowRight onClick={()=>paginationNextHandler(current+1)}/>
                 
              </div>}
            </div>
        </>
    );
}

export default ManageInvoice
