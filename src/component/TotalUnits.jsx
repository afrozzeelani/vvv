import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoDownload } from "react-icons/go";
import { useLocation, Link } from 'react-router-dom';
import { base_Url } from '../pages/api';
import "./manageUnit.css";

const TotalUnits = () => {
    const location = useLocation().pathname;
    const [data, setData] = useState(null);
    const [viewData, setViewData] = useState(null);
    const [searchKeyWord, setSearchKeyWord] = useState('');
    const itemsPerPage = 10;
    function getTotalQuantities(obj) {
        const result = {};
        for (const key in obj) {
          if (obj.hasOwnProperty(key)) {
            const batches = obj[key];
            let totalQuantity = 0;
            batches.forEach(batch => {
              totalQuantity += batch.quantity;
            });
            if(totalQuantity!==0){
                result[key] = totalQuantity;
            }
            
          }
        }
        return result;
      }
    const allUnits = async () => {
        try {
            const response = await axios.get(`${base_Url}/noOfUnit/noOfUnit`);
            console.log(response)
            const transformedObject = getTotalQuantities(response.data.data);
            setData(transformedObject);
            setViewData(transformedObject);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        allUnits();
    }, []);

    const pdfSaveHandler = () => {
        if (viewData) {
            const doc = new jsPDF();
            const headers = [['S No.', 'Product Name', 'Total No Of Units']];
            const body = Object.entries(viewData).map(([productName, totalUnits], index) => [
                index + 1,
                productName,
                totalUnits
            ]);

            autoTable(doc, {
                head: headers,
                body: body,
                startY: 15,
                margin: { top: 20 },
                styles: { cellPadding: 2, fontSize: 10, valign: 'middle', halign: 'center' },
                headStyles: { fillColor: [15, 96, 96], textColor: 255, fontSize: 12, fontStyle: 'bold' },
                didDrawCell: (data) => {
                    // No need for additional logic here since we're not modifying cells
                }
            });

            doc.save('Units in Stock.pdf');
        }
    };

    const searchHandler = (e) => {
        const keyword = e.target.value.toLowerCase();
        setSearchKeyWord(keyword);
        if (keyword.length > 0) {
            const filteredData = Object.fromEntries(
                Object.entries(data).filter(([productName]) => productName.toLowerCase().includes(keyword))
            );
            setViewData(filteredData);
        } else {
            setViewData(data);
        }
    };

    return (
        <>
            <div className='purchase'>
                <div className='purchase-button'>
                    <ul>
                        <li className={location === "/unit" ? "subactive" : ""}><Link to="/unit">Total Units</Link></li>
                        <li className={location === "/unit/batchUnits" ? "subactive" : ""}><Link to="/unit/batchUnits">All Batch Units</Link></li>
                        <div className='download-container' >
                            <GoDownload onClick={pdfSaveHandler} />
                        </div>
                    </ul>
                    <div className='input-container'><input placeholder='Product Name' value={searchKeyWord} onChange={(e) => searchHandler(e)} /></div>
                </div>
                <div className='purchase-table'>
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '50px' }}>S No.</th>
                                <th style={{ width: '200px' }}>Product Name</th>
                                <th style={{ width: '200px' }}>Total No Of Units</th>
                            </tr>
                        </thead>
                        <tbody>
                            {viewData &&
                                Object.entries(viewData).map(([productName, totalUnits], index) => (
                                    <tr key={index}>
                                        <td>{index + 1}</td>
                                        <td>{productName}</td>
                                        <td>{totalUnits}</td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default TotalUnits;
