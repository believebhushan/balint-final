import { db } from "../firebase-config";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";

const printerCollectionRef = collection(db,"printers");

class PrinterDataService{

    addPrinter = (newPrinter) => {
        return addDoc(printerCollectionRef,newPrinter);
    };

    updatePrinter = (id, updatedPrinter) => {
        const PrinterDoc = doc(db , "printers", id);
        return updateDoc(PrinterDoc,updatedPrinter);
    };

    deletePrinter = (id) =>{
        const PrinterDoc = doc(db , "printers", id);
        return deleteDoc(PrinterDoc);
    };

    getPrinter = async (id) => {
        const PrinterDoc =  doc(db,"printers",id);
        return await getDoc(PrinterDoc);
    }

    getAllPrinter = async () => {
        const doc_refs = await getDocs(printerCollectionRef);
        const res = []
        doc_refs.forEach(printer => {
            res.push({
                id: printer.id, 
                ...printer.data()
            })
        });
        return res
    }

    getAllPrinterByLocationCode = async (locationCode) => {
        const q = query(printerCollectionRef, where("location", "==", locationCode))
        const doc_refs = await getDocs(q);
        const res = []
        doc_refs.forEach(printer => {
            res.push({
                id: printer.id, 
                ...printer.data()
            })
        });
        return res
    }

    getPrinterByName = async (name) => {
        const q = query(printerCollectionRef, where("printerName", "==", name));
        const doc_refs = await getDocs(q);
        const res = []
        doc_refs.forEach(printer => {
            res.push({
                id: printer.id, 
                ...printer.data()
            })
        });
        return res
    }

    updateMultipleByLocationCode = async (locationCode,newupdatedContent) => {
        const q = query(printerCollectionRef, where("location", "==", locationCode));
        const doc_refs = await getDocs(q);
        doc_refs.forEach(printer => async function() {
            const PrinterDoc = doc(db , "printers", printer.id);
            await updateDoc(PrinterDoc,newupdatedContent);
        });
        return;
    }
}

export default new PrinterDataService();