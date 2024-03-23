import React, { useEffect, useState } from 'react';
import "../pages/managersuplier.css";
import { RiDeleteBinLine } from "react-icons/ri";
import axios from 'axios';
import { base_Url } from '../pages/api';
import { MdKeyboardArrowLeft } from "react-icons/md";
import { MdKeyboardArrowRight } from "react-icons/md";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import InvoiceNav from './InvoiceNav';
import { useLocation } from 'react-router-dom';
const PaidInvoices = () => {
    const location = useLocation().pathname;
    const doc = new jsPDF({ orientation: 'landscape' });
    const [data, setData] = useState(null);
    const [viewData, setViewData] = useState(data);
    const [current, setCurrent] = useState(1)
    const [searchKeyWord, setSearchKeyWord] = useState("");

    const allPurchase = async () => {
        try {
            const response = await axios.get(`${base_Url}/invoice/allInvoices`);
           
          let filterData =   response.data.result[0].arr.filter((val,i)=>{
                return val.paidStatus !== "partiallyPaid" && val.paidStatus!=="unpaid" && val.status==="Approved"
            })

            setData(filterData);
            setViewData(filterData)
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
    const pdfSaveHandler = () => {
        if(data.length<1) return;
        if (data && Array.isArray(data)) {
           
            doc.setFontSize(10);
            doc.text("Paid Invoices Data", 5, 5);
            
            const headers = [
                ["No.", 'Date', 'Purchase_no', "Product_Name", 'Cutomer_Email', 'Hsn', "Unit Cost", "QTY", "discount", "Tax Name", "Total Price","Paid Amount", "Paid Status"]
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
    
            doc.save('PaidInvoice.pdf');
        }
    }; 
    

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
  return (
    <div className='purchase'>
    <InvoiceNav location={location} pdfSaveHandler={pdfSaveHandler} searchKeyWord={searchKeyWord} searchHandler={searchHandler}/>
    <div className='purchase-table'>
        <table>
            <thead>
                <tr>
                    <th>S No.</th>
                    <th>ID</th>
                    <th>Date</th>
                    <th >Product Name </th>
                    <th >Category</th>
                    <th >QTY</th>
                    <th >Total Price</th>
                    <th>Paid status</th>
                  
                    <th>Paid</th>
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
                            <td>{val.product_Name }</td>
                            <td>{val.category_name }</td>
                            <td>{val.noOfUnit}</td>
                            <td>{val.totalPrice }</td>
                            <td>{val.paidStatus}</td>
                          
                            <td>{val.paidAmount}</td>

                            
                            <td className='approve'>{val.status}</td>
                           
                           {val.status==="pending" || val.status==="rejected"? <td><RiDeleteBinLine onClick={() => deleteHandler(val._id)} /></td>:<td></td>}
                        </tr>
                    ))
                }
            </tbody>
        </table>
    </div>
   {viewData?.length>10 &&  <div className='managersuplier-pagination'>
                      
                      <MdKeyboardArrowLeft onClick={() => paginationPrevHandler(current - 1)}/>
                      <li>{current}</li>
                      <MdKeyboardArrowRight onClick={()=>paginationNextHandler(current+1)}/>
                 
              </div>}
</div>
  )
}

export default PaidInvoices
