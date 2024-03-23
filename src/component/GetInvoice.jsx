import React, {useState} from 'react'
import "./getInvoices.css";
import { base_Url } from '../pages/api';
import axios from "axios";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import InvoiceNav from './InvoiceNav';
import { useLocation } from 'react-router-dom';
import Invoice from './Invoice';
const GetInvoice = () => {
    const location = useLocation().pathname;
    const doc = new jsPDF({ orientation: 'landscape' });
    const [data, setData] = useState({
        startDate: "",
        endDate: "",
        status: "Approved"
    });
    const [date, setDate] = useState(data);
    const [receivedData, setReceivedData] = useState(null);
    const [viewToggle, setViewToggle] = useState(false);
    const [copyData, setCopyData] = useState(receivedData)
    const [current, setCurrent] = useState(1)
    const [searchKeyWord, setSearchKeyWord] = useState("");
    const [viewPurchase, setViewPurchase] = useState(null);
    const allPurchase = async () => {
        try {
            const response = await axios.post(`${base_Url}/invoice/find_product_list`, data);
            console.log(response.data.data)
            setReceivedData(response.data.data)
            setCopyData(response.data.data)
         
        } catch (error) {
            console.log(error);
        }
    }
    const submitHandler = (e)=>{
        e.preventDefault();
        setDate(data);
        allPurchase();
        setData({
            startDate: "",
            endDate: "",
            status: "Approved"
        })
    }
    const paginationPrevHandler =(page)=>{
        
        if(page<1) return;
      setCurrent(page);
    }
    const paginationNextHandler = (page)=>{
        if(page*10-9>data.length) return;
        setCurrent(page);
    }
    const pdfSaveHandler = () => {
        if(receivedData && receivedData.length<1) return;
        if (receivedData && Array.isArray(receivedData)) {
           
            doc.setFontSize(10);
            doc.text(`Invoices Data from ${date.startDate} - To  ${date.endDate}`, 5, 5);
            
            const headers = [
                ["No.", 'Date', 'Purchase_no', "Product_Name", 'Cutomer_Email', 'Hsn', "Unit Cost", "QTY", "discount", "Tax Name", "Total Price","Paid Amount", "Due Amount", "Paid Status"]
            ];
            const body = receivedData.map((item, i) => [
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
    
            doc.save(`Invoices Data from ${date.startDate} - To  ${date.endDate}`);
        }
    }; 
    const searchHandler = (e) => {
        console.log(e.target.value.length)
        if (e.target.value.length>0) {
            const filterData = receivedData.filter((val) => {
                return val.purchase_no.includes(e.target.value);
            });
            setCopyData(filterData);
        }else if(e.target.value.length===0){
            setCopyData(receivedData)
        }
        setSearchKeyWord(e.target.value)
    }
  return (
    <> {viewToggle ? <Invoice  viewPurchase={viewPurchase} setViewToggle={setViewToggle} /> : <></>}
    <div className='purchase'>
         <InvoiceNav location={location} pdfSaveHandler={pdfSaveHandler} searchKeyWord={searchKeyWord} searchHandler={searchHandler}/>
        <form onSubmit={submitHandler}>
            <input type='date' value={data.startDate} onChange={(e)=>setData((prev)=>({...prev, startDate:e.target.value}))}/>
            <input type='date' value={data.endDate} onChange={(e)=>setData((prev)=>({...prev, endDate:e.target.value}))}/>
            <button type='submit'>Search</button>
        </form>
   
  
    <div className='purchase-table'>
        <table>
            <thead>
                <tr>
                    <th>S No.</th>
                    <th>Purchase No.</th>
                    <th>Product Name</th>
                    <th>Date</th>
                
                    <th>category</th>
                    <th>QTY</th>
                    <th>Unit Cost</th>
                    <th>Total Cost</th>
                    <th>Status</th>
                  <th>Action</th>
                </tr>
            </thead>
            <tbody>
                {
                    copyData && copyData.slice(current * 10 - 10, current * 10).map((val, i) => (
                        <tr key={val.id}>
                            <td>{(current - 1) * 10 + i + 1}</td>
                            <td>{val.purchase_no}</td>
                            <td>{val.product_Name}</td>
                            <td>{val.date}</td>
                     
                            <td>{val.category_name}</td>
                            <td>{val.noOfUnit}</td>
                            <td>{val.perUnitPrice}</td>
                            <td>{val.totalPrice}</td>
                            <td className='approve'>{val.status}</td>
                            <td><MdOutlineRemoveRedEye className='visible' onClick={()=> (setViewPurchase(val.purchase_no),setViewToggle(true))}/></td>
                        </tr>
                    ))
                }
            </tbody>
        </table>
    </div>
    {copyData?.length > 10 && <div className='managersuplier-pagination'>
    <MdKeyboardArrowLeft onClick={() => paginationPrevHandler(current - 1)}/>
                            <li>{current}</li>
                            <MdKeyboardArrowRight onClick={()=>paginationNextHandler(current+1)}/>
    </div>}
</div>

</>
  )
}

export default GetInvoice
