import { useState } from 'react';
import lucia from "../lucia";
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function Apply() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    
    lucia.pageView("Apply");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: '', message: '' });

        const formData = {
            email: e.target.email.value,
            xAccount: e.target.xAccount.value,
            industry: e.target.industry.value,
            arr: e.target.arr.value,
            timestamp: new Date()
        };

        try {
            // Add form data to Firestore
            await addDoc(collection(db, "applications"), formData);
            setSubmitStatus({
                type: 'success',
                message: 'Application submitted successfully!'
            });
            e.target.reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            setSubmitStatus({
                type: 'error',
                message: 'Error submitting form. Please try again.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[768px] mx-auto px-4 py-12 leading-relaxed text-gray-800">
            <h2 className="text-4xl font-bold mb-12 text-gray-900">Apply</h2>
            
            {submitStatus.message && (
                <div className={`mb-6 p-4 rounded-md ${
                    submitStatus.type === 'success' 
                        ? 'bg-green-50 text-green-800' 
                        : 'bg-red-50 text-red-800'
                }`}>
                    {submitStatus.message}
                </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-gray-700">Email Address</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="xAccount" className="block text-gray-700">X Account</label>
                    <input
                        type="text"
                        id="xAccount"
                        name="xAccount"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="industry" className="block text-gray-700">Business Industry</label>
                    <input
                        type="text"
                        id="industry"
                        name="industry"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="arr" className="block text-gray-700">ARR</label>
                    <input
                        type="text"
                        id="arr"
                        name="arr"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full px-6 py-3 bg-gray-900 text-white rounded-md transition-colors ${
                        isSubmitting 
                            ? 'opacity-50 cursor-not-allowed' 
                            : 'hover:bg-gray-800'
                    }`}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
}

export default Apply;
