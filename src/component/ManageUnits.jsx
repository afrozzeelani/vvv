import React, { useState, useEffect } from 'react';
import { base_Url } from '../pages/api';
import axios from 'axios';
import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight } from 'react-icons/md';
import "./manageUnit.css";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { GoDownload } from "react-icons/go";
import { useLocation,Link } from 'react-router-dom';
const ManageUnits = () => {
    const doc = new jsPDF();
    const location = useLocation().pathname;
    const [data, setData] = useState(null);
    const [viewData, setViewData] = useState(null);
    const [current, setCurrent] = useState(1);
    const [searchKeyWord, setSearchKeyWord] = useState('');
    const [serialNo, setSerialNo] = useState(1);
    let serail = 1;
    const itemsPerPage = 10;

    const allUnits = async () => {
        try {
            const response = await axios.get(`${base_Url}/noOfUnit/noOfUnit`);
            console.log(response.data.data)
            setData(response.data.data);
            setViewData(response.data.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        allUnits();
    }, []);

    const pdfSaveHandler = () => {
        let serial = 1;
        if (data) {
            const headers = [['S no.', 'Product Name', 'Batch No.', 'No Of Units']];
            const body = [];
            let rowIndex = 0;
            const productColors = {}; // Object to store product names and their colors
    
            Object.entries(viewData).forEach(([productName, batches], pageIndex) => {
                const rowspanCount = batches.length; // Calculate rowspan count for the current product
                batches.forEach((batch, i) => {
                    body.push([
                        i === 0 ? serial : '', // rowspan for serial number
                        i === 0 ? { content: productName, rowspan: rowspanCount, styles: { fillColor: productColors[productName] || [255, 255, 255] } } : '', // rowspan for product name with color
                        batch.batchNo,
                        batch.quantity,
                    ]);
                    serial++;
                });
                if (!productColors[productName]) {
                    productColors[productName] = [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)]; // Generate a random color for the product name
                }
                rowIndex += rowspanCount; // Increment rowIndex by rowspanCount
            });
    
            autoTable(doc, {
                head: headers,
                body: body,
                startY: 5,
                startX: 5,
                margin: { left: 5, right: 5 },
                tableWidth: 'auto',
                styles: { cellPadding: 2, fontSize: 10, valign: 'middle', halign: 'center' },
                headStyles: { fillColor: [15, 96, 96], textColor: 255, fontSize: 12, fontStyle: 'bold', minCellHeight: 10 },
                bodyStyles: { minCellHeight: 8, alternateRowStyles: { fillColor: [255, 204, 153] } },
                didDrawCell: (data) => {
                    if (data.column.index === 0 && data.row.index === rowIndex - 1) {
                        // Adjust rowspan for serial number
                        const rowSpanHeight = data.row.height * rowIndex;
                        doc.rect(data.cell.x, data.cell.y, data.cell.width, rowSpanHeight, 'S');
                    }
                    if (data.column.index === 1 && data.row.index === rowIndex - 1) {
                        // Adjust rowspan for product name
                        const rowSpanHeight = data.row.height * rowIndex;
                        doc.rect(data.cell.x, data.cell.y, data.cell.width, rowSpanHeight, 'S');
                    }
                    if (data.column.index === 3 && data.row.index === rowIndex - 1) {
                        // Calculate total quantity and draw at the last row of each product group
                        const productName = body[data.row.index][1].content;
                        const totalQuantity = body.filter(row => row[1]?.content === productName)
                            .reduce((total, row) => total + parseInt(row[3] || 0), 0);
                        doc.text(totalQuantity.toString(), data.cell.x + 2, data.cell.y + 2);
                    }
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
            setCurrent(1);
        } else {
            setViewData(data);
            setCurrent(1);
        }
    };

    const paginationPrevHandler = () => {
        if (current > 1) {
            setCurrent(current - 1);
        }
    };

    const paginationNextHandler = () => {
        if (viewData) {
            const totalPages = Math.ceil(Object.keys(viewData).length / itemsPerPage);
            if (current < totalPages) {
                setCurrent(current + 1);
            }
        }
    };

    return (
        <>
            <div className='purchase'>
                <div className='purchase-button'>
                    <ul>
                    <li className={location==="/unit"?"subactive":"" } ><Link to="/unit">Total Units</Link></li>
                    <li className={location === "/unit/batchUnits" ? "subactive" : ""} ><Link to="/unit/batchUnits">All Batch Units </Link></li>
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
                                <th style={{ width: '117px' }}>S no.</th>
                                <th style={{ width: '117px' }}>Product Name</th>
                                <th style={{ width: '117px' }}>Batch No.</th>
                                <th style={{ width: '80px' }}>No Of Units</th>
                            
                            </tr>
                        </thead>
                        <tbody>
                            {viewData &&
                                Object.entries(viewData)
                                    .slice((current - 1) * itemsPerPage, current * itemsPerPage)
                                    .flatMap(([productName, batches], pageIndex) =>
                                     
                                        batches.map((batch, i) => {
                                            const currentSerialNo = (current - 1) * itemsPerPage + i + 1;
                                            if (currentSerialNo > serialNo) { 
                                                setSerialNo(currentSerialNo);
                                            }
                                   
                                            return (
                                                <tr key={`${productName}-${i}`}>
                                                    <td>{serail++}</td>
                                                    {i === 0 && <td rowSpan={batches.length}>{productName}</td>}
                                                    <td>{batch.batchNo}</td>
                                                    <td className={batch.quantity==0? "short": ""}>{batch.quantity}</td>
                                                 
                                                </tr>
                                            );
                                        })
                                       
                                    )
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default ManageUnits;




