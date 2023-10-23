import { db } from "../firebase-config";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";

const operatorCollectionRef = collection(db,"operators");

class OperatorDataService{

    addOperators = (newOperator) => {
        return addDoc(operatorCollectionRef,newOperator);
    };

    updateOperator = (id, updatedOperator) => {
        const operatorDoc = doc(db , "operators", id);
        return updateDoc(operatorDoc,updatedOperator);
    };

    deleteOperator = (id) =>{
        const operatorDoc = doc(db , "operators", id);
        return deleteDoc(operatorDoc);
    };

    getAllOperators = async () =>{
        return await getDocs(operatorCollectionRef);
    }

    getOperator = async (id) => {
        const operatorDoc =  doc(db,"operators",id);
        return await getDoc(operatorDoc);
    }

    loginOperator = async (status ,locationCode ) =>{
        const loginQuery = query(operatorCollectionRef, where("status", "==", status), where("location", "==", locationCode));
        const response = await getDocs(loginQuery);
        const res = []
        if(response.docs.length>0){
            response.forEach(Operator => {
                res.push({
                    id: Operator.id, 
                    ...Operator.data()
                })
            });
        }
        return res;
    }

    loginOperatorByCode = async (locationCode) =>{
        const loginQuery = query(operatorCollectionRef,where("location", "==", locationCode));
        const response = await getDocs(loginQuery);
        const res = []
        if(response.docs.length>0){
            response.forEach(Operator => {
                res.push({
                    id: Operator.id, 
                    ...Operator.data()
                })
            });
        }
        return res;
    }

}

export default new OperatorDataService();