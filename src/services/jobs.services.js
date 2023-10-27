import { db } from "../firebase-config";
import { collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, query, where } from "firebase/firestore";

const jobCollectionRef = collection(db,"jobrequests");

class JobDataService{

    addJob = (newJob) => {
        return addDoc(jobCollectionRef,newJob);
    };

    updateJob = (id, updatedJob) => {
        const JObDoc = doc(db , "jobrequests", id);
        return updateDoc(JObDoc,updatedJob);
    };

    deleteJob = (id) =>{
        const JObDoc = doc(db , "jobrequests", id);
        return deleteDoc(JObDoc);
    };

    getJob = async (id) => {
        const JObDoc =  doc(db,"jobrequests",id);
        const resp =  await getDoc(JObDoc);
        return {
            ...resp.data(),
            id: resp.id
          } 
    }

    requestJobByCode = async (locationCode) =>{
        const loginQuery = query(jobCollectionRef,where("location", "==", locationCode));
        const response = await getDocs(loginQuery);
        const res = []
        if(response.docs.length>0){
            response.forEach(job => {
                res.push({
                    id: job.id, 
                    ...job.data()
                })
            });
        }
        return res;
    }

    getAllJob = async () => {
        const doc_refs = await getDocs(jobCollectionRef);
        const res = []
        doc_refs.forEach(job => {
            res.push({
                id: job.id, 
                ...job.data()
            })
        });
        return res
    }

    getAllJobByLocationCode = async (locationCode) => {
        const q = query(jobCollectionRef, where("location", "==", locationCode))
        const doc_refs = await getDocs(q);
        const res = []
        doc_refs.forEach(job => {
            res.push({
                id: job.id, 
                ...job.data()
            })
        });
        return res
    }
}

export default new JobDataService();