import React, {useState} from 'react'
import "./getInvoices.css";
import { base_Url } from '../pages/api';
import axios from "axios";
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import PurchaseNav from './PurchaseNav';
import { useLocation } from 'react-router-dom';
const GetPurchase = () => {
    const location = useLocation().pathname;
    const [data, setData] = useState({
        startDate: "",
        endDate: "",
        status: "Approved"
    });
    const [data1, setData1] = useState(data);
    const [receivedData, setReceivedData] = useState(null);
    const [current, setCurrent] = useState(1)
    const [searchKeyWord, setSearchKeyWord] = useState("");
    const [copyData, setCopyData] = useState(receivedData);
    const doc = new jsPDF();
    const allPurchase = async () => {
        try {
            const response = await axios.post(`${base_Url}/product_details/find_product_list`, data);
            setReceivedData(response.data.data)
            console.log(response.data.data)
            setCopyData(response.data.data)
        
        } catch (error) {
            console.log(error);
        }
    }
    const submitHandler = (e)=>{
        e.preventDefault();
        allPurchase();
        setData1(data);
        setData({
            startDate: "",
            endDate: "",
            status: "Approved"
        })
    }
    const pdfSaveHandler = () => {
        console.log(data1)
        if(copyData && copyData.length<1){
         return;
        }
         if (copyData && Array.isArray(copyData)) {
           
             doc.setFontSize(10);
             doc.text(`Purchase Data from ${data1.startDate} - To ${data1.endDate}`, 5, 5);
             
             const headers = [
                 ["No.", 'Date', 'Purchase_no', "Product_Name", 'Suplire_Email', 'Hsn', "Unit Cost", "QTY", "Tax Name", "Total Price"]
             ];
             const body = copyData.map((item, i) => [
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
     
             doc.save(`Purchase Data from ${data1.startDate} - To ${data1.endDate}`);
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
   
        <div className='purchase'>
                <PurchaseNav location={location}  pdfSaveHandler={pdfSaveHandler} searchKeyWord={searchKeyWord} searchHandler={searchHandler}/>
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
                    <th>ID</th>
                    <th>Date</th>
                    <th>Product Name</th>
                    <th>Supplier Email</th>
                    <th>QTY</th>
                    <th>Amount</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                {
                    copyData && copyData.slice(current * 10 - 10, current * 10).map((val, i) => (
                        <tr key={val.id}>
                            <td>{(current - 1) * 10 + i + 1}</td>
                            <td>{val.purchase_no}</td>
                            
                            <td>{val.date}</td>
                            <td>{val.product_Name}</td>
                            <td>{val.suplire_Email}</td>
                            <td>{val.noOfUnit}</td>
                            <td>{val.totalPrice}</td>
                            <td>{val.status}</td>
                           
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

  )
}

export default GetPurchase
