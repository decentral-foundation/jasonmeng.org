import { useState } from 'react';
import lucia from "../lucia";
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function Apply() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });
    
    lucia.pageView("Apply");
    

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus({ type: '', message: '' });

        try {
            console.log('Starting form submission...');
            
            const formData = {
                email: e.target.email.value,
                xAccount: e.target.xAccount.value,
                cvUrl: e.target.cvUrl.value,
                skills: e.target.skills.value,
                createdAt: serverTimestamp()
            };

            console.log('Form data prepared:', formData);
            console.log('Firestore instance:', db);

            // Add form data to Firestore
            console.log('Attempting to add document to Firestore...');
            const docRef = await addDoc(collection(db, "applications"), formData);
            
            console.log("Document written with ID:", docRef.id);
            
            setSubmitStatus({
                type: 'success',
                message: 'Application submitted successfully!'
            });

            console.log("calling lucia update user id")
            lucia.updateUserId({name: "visitor"},formData.email)
            console.log("done with call");
            e.target.reset();
        } catch (error) {
            console.error("Error submitting form:", error);
            console.error("Error details:", {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            
            setSubmitStatus({
                type: 'error',
                message: `Error submitting form: ${error.message}`
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-[768px] mx-auto px-4 py-12 leading-relaxed text-gray-800">
            <h2 className="text-4xl font-bold mb-6 text-gray-900">Executive Assistant Position</h2>
            
            <div className="mb-12 space-y-6 text-gray-700">
                <p className="text-lg">Looking for an exceptional Executive Assistant to support high-impact entrepreneurial ventures and strategic initiatives.</p>
                
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Role Overview:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Direct support to founder in managing complex schedules, communications, and projects</li>
                        <li>Coordinate with internal teams, external partners, and stakeholders</li>
                        <li>Handle sensitive information with utmost discretion and professionalism</li>
                        <li>Drive operational efficiency and process improvements</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">Key Requirements:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Exceptional organizational and time management skills</li>
                        <li>Strong written and verbal communication abilities</li>
                        <li>Proactive problem-solving mindset</li>
                        <li>Experience in fast-paced, entrepreneurial environments</li>
                        <li>Tech-savvy with proficiency in modern productivity tools</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-gray-900">What We Offer:</h3>
                    <ul className="list-disc pl-5 space-y-2">
                        <li>Competitive compensation package</li>
                        <li>Opportunity to work directly with founder and key decision-makers</li>
                        <li>Exposure to cutting-edge projects and ventures</li>
                        <li>Professional growth and development opportunities</li>
                    </ul>
                </div>
            </div>

            <h3 className="text-2xl font-semibold mb-6 text-gray-900">Application Form</h3>
            
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
                    <label htmlFor="cvUrl" className="block text-gray-700">CV/Resume URL</label>
                    <input
                        type="url"
                        id="cvUrl"
                        name="cvUrl"
                        required
                        pattern="https?://.+"
                        placeholder="https://your-cv-link.com"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                        onInvalid={(e) => {
                            if (e.target.validity.patternMismatch) {
                                e.target.setCustomValidity('Please enter a valid URL starting with http:// or https://');
                            } else if (e.target.validity.valueMissing) {
                                e.target.setCustomValidity('Please provide a URL to your CV');
                            }
                        }}
                        onInput={(e) => e.target.setCustomValidity('')}
                    />
                    <p className="text-sm text-gray-600 mt-1">Please provide a link to your CV/resume (e.g., Google Drive, Dropbox, or personal website)</p>
                </div>

                <div className="space-y-2">
                    <label htmlFor="skills" className="block text-gray-700">Key Skills & Tools</label>
                    <textarea
                        id="skills"
                        name="skills"
                        required
                        placeholder="List your relevant skills, software proficiency, and tools you're experienced with"
                        rows="4"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    ></textarea>
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
