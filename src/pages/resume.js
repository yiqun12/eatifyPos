// File: src/App.js
import React, { useState, useEffect } from 'react';
import 'tailwindcss/tailwind.css';
import Select from 'react-select';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

const App = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    email: '',
    phone: '',
    createGmail: '',
    gmail: '',
    password: '',
    school: '',
    degree: '',
    fieldOfStudy: '',
    gpa: '',
    startDate: '',
    endDate: '',
    workAuthorization: '',
    sponsorship: '',
    citizenship: '',
    employmentStatus: '',
    desiredSalary: '',
    desiredEmploymentStatus: [], // Multi-select field
    jobLevel: [], // Multi-select field
    jobTitles: [], // Array of objects with title, levels, and statuses
    resume: null,
    locationPreferences: [], // Array of selected locations
    workTypePreferences: [], // Array of selected work types
  });

  const [prefillData, setPrefillData] = useState({}); // Initially empty
  const [previewImages, setPreviewImages] = useState([]); // Stores preview images for the PDF

  const [hasUploadedPdf, setHasUploadedPdf] = useState(false); // Tracks if a PDF has been uploaded
  const [hasLoggedPdf, setHasLoggedPdf] = useState(false); // Tracks if "hello" has been logged for the current PDF
  const [currentStep, setCurrentStep] = useState(0);
  const [modalImage, setModalImage] = useState(null); // Stores the image to display in the modal

  useEffect(() => {
    // Simulate fetching data after 10 seconds
    const timer = setTimeout(() => {
      setPrefillData({
        personalInformation: {
          fullName: "John Doe",
          address: "123 Elm Street, Springfield",
          email: "john.doe@example.com",
          phone: "123-456-7890",
          createGmail: "no",
          gmail: "john.doe@gmail.com",
          password: "securepassword123",
        },
        educationHistory: {
          school: "Springfield University",
          degree: "Bachelor of Science",
          fieldOfStudy: "Computer Science",
          gpa: "3.8",
          startDate: "09/2015",
          endDate: "05/2019",
        },
      });
    }, 10000);

    return () => clearTimeout(timer); // Clean up timer
  }, []);

  useEffect(() => {
    // Auto-fill form when prefillData becomes available
    if (prefillData.personalInformation) {
      setFormData((prev) => ({
        ...prev,
        ...prefillData.personalInformation,
        ...prefillData.educationHistory,
      }));
    }
  }, [prefillData]);

  const steps = [
    ResumeUpload,
    WorkAuthorization,
    EmploymentStatus,
    PersonalInformation,
    EducationHistory,
    PricingSection,
  ];

  const CurrentStepComponent = steps[currentStep];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];

    // Validate if the file is a PDF
    if (file && file.type === "application/pdf") {
      setFormData((prev) => ({ ...prev, resume: file }));
      setHasUploadedPdf(true);
      setHasLoggedPdf(false); // Reset logging for a new file

      // Convert PDF to images
      const images = await convertPdfToImages(file);
      setPreviewImages(images);
    }
  };
  const convertPdfToImages = async (file) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await getDocument(arrayBuffer).promise;
    const images = [];

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });

      // Create a canvas to render the PDF page
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({ canvasContext: context, viewport }).promise;

      // Convert the canvas to an image URL
      const imageUrl = canvas.toDataURL('image/png');
      images.push(imageUrl);
    }

    return images;
  };

  const handleNext = () => {
    if (!hasLoggedPdf && formData.resume) {
      console.log("hello");
      setHasLoggedPdf(true); // Mark that "hello" has been logged for this PDF
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const openModal = (image) => {
    setModalImage(image);
  };

  const closeModal = () => {
    setModalImage(null);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <h1 className="text-2xl font-bold text-center mb-4">Job Application Form</h1>
        <CurrentStepComponent
          formData={formData}
          onChange={handleChange}
          previewImages={previewImages}
          onFileChange={handleFileChange}
          onOpenModal={openModal}
        />
        <div className="flex justify-between mt-6">
          {currentStep > 0 && <Button onClick={handleBack}>Back</Button>}
          <div className="flex justify-end w-full">
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={() => console.log("Submitting form")}>Submit</Button>
            )}
          </div>
        </div>
      </div>
      {modalImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]"
          onClick={closeModal} // Close modal on background click
        >
          <div className="relative">
            <img src={modalImage} alt="Large Preview" className="max-w-full max-h-screen rounded shadow-lg" />
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 bg-white text-black rounded-full p-2"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Step Components
const PersonalInformation = ({ formData, onChange, onPrefill }) => (
  <Section title="Personal Information">

    <Input name="fullName" label="Full Name" value={formData.fullName} onChange={onChange} />
    <Input name="address" label="Address" value={formData.address} onChange={onChange} />
    <Input name="email" label="Email Address" value={formData.email} onChange={onChange} />
    <Input name="phone" label="Phone Number" value={formData.phone} onChange={onChange} />
    <RadioGroup
      name="createGmail"
      label="Would you like us to create Gmail for you?"
      options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
      value={formData.createGmail}
      onChange={onChange}
    />
    {formData.createGmail === 'no' && (
      <>
        <Input name="gmail" label="Gmail" value={formData.gmail} onChange={onChange} />
        <Input name="password" label="Password" type="password" value={formData.password} onChange={onChange} />
      </>
    )}
  </Section>
);

const EducationHistory = ({ formData, onChange, onPrefill }) => (
  <Section title="Education History">

    <Input name="school" label="School/University" value={formData.school} onChange={onChange} />
    <Input name="degree" label="Degree" value={formData.degree} onChange={onChange} />
    <Input name="fieldOfStudy" label="Field of Study" value={formData.fieldOfStudy} onChange={onChange} />
    <Input name="gpa" label="GPA" value={formData.gpa} onChange={onChange} />
    <div className="grid grid-cols-2 gap-4">
      <Input name="startDate" label="Start Date (MM/YYYY)" value={formData.startDate} onChange={onChange} />
      <Input name="endDate" label="End Date (MM/YYYY)" value={formData.endDate} onChange={onChange} />
    </div>
  </Section>
);

const WorkAuthorization = ({ formData, onChange }) => (
  <Section title="Work Authorization">
    <Dropdown
      name="workAuthorization"
      label="Work Authorization"
      options={[
        'US Citizen',
        'Green Card Holder',
        'H1B',
        'OPT/CPT',
        'Other',
      ]}
      value={formData.workAuthorization}
      onChange={onChange}
    />
    {(formData.workAuthorization !== 'US Citizen' &&
      formData.workAuthorization !== 'Green Card Holder') && (
        <RadioGroup
          name="sponsorship"
          label="Will you require visa sponsorship?"
          options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
          value={formData.sponsorship}
          onChange={onChange}
        />
      )}
  </Section>
);


const EmploymentStatus = ({ formData, onChange }) => {
  const [jobTitleInput, setJobTitleInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [locationType, setLocationType] = useState('Remote'); // Default to Remote

  const locationOptions = [
    { value: 'New York City Metropolitan Area', label: 'New York City Metropolitan Area' },
    { value: 'Los Angeles Metropolitan Area', label: 'Los Angeles Metropolitan Area' },
    { value: 'Chicago Metropolitan Area', label: 'Chicago Metropolitan Area' },
    { value: 'San Francisco Bay Area', label: 'San Francisco Bay Area' },
    { value: 'Houston Metropolitan Area', label: 'Houston Metropolitan Area' },
    { value: 'Boston Metropolitan Area', label: 'Boston Metropolitan Area' },
    { value: 'Washington, D.C. Metropolitan Area', label: 'Washington, D.C. Metropolitan Area' },
    { value: 'Seattle Metropolitan Area', label: 'Seattle Metropolitan Area' },
    { value: 'Atlanta Metropolitan Area', label: 'Atlanta Metropolitan Area' },
    { value: 'Phoenix Metropolitan Area', label: 'Phoenix Metropolitan Area' },
    { value: 'Dallas-Fort Worth Metropolitan Area', label: 'Dallas-Fort Worth Metropolitan Area' },
    { value: 'San Diego Metropolitan Area', label: 'San Diego Metropolitan Area' },
    { value: 'Miami-Fort Lauderdale Area', label: 'Miami-Fort Lauderdale Area' },
    { value: 'Austin Metropolitan Area', label: 'Austin Metropolitan Area' },
    { value: 'Philadelphia Metropolitan Area', label: 'Philadelphia Metropolitan Area' },
  ]

  const workTypeOptions = [
    { value: 'Remote', label: 'Remote' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'Onsite', label: 'Onsite' },
  ];

  const handleLocationChange = (selectedOptions) => {
    onChange({
      target: {
        name: 'locationPreferences',
        value: selectedOptions ? selectedOptions.map((option) => option.value) : [],
      },
    });
  };

  const handleWorkTypeChange = (selectedOptions) => {
    onChange({
      target: {
        name: 'workTypePreferences',
        value: selectedOptions ? selectedOptions.map((option) => option.value) : [],
      },
    });
  };


  // Options for Employment Status
  const employmentStatusOptions = [
    { value: 'full-time', label: 'Full-Time' },
    { value: 'part-time', label: 'Part-Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
  ];

  // Options for Job Level
  const jobLevelOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'staff', label: 'Staff' },
    { value: 'director', label: 'Director' },
    { value: 'executive', label: 'Executive' },
  ];

  const handleMultiSelectChange = (selectedOptions, fieldName) => {
    onChange({
      target: {
        name: fieldName,
        value: selectedOptions ? selectedOptions.map((option) => option.value) : [],
      },
    });
  };

  const handleAddJobTitle = () => {
    if (jobTitleInput.trim() && formData.jobLevel.length > 0 && formData.desiredEmploymentStatus.length > 0) {
      const existingTitles = [...formData.jobTitles];

      // Check if the title already exists in jobTitles
      const existingIndex = existingTitles.findIndex((item) => item.title === jobTitleInput.trim());
      if (existingIndex !== -1) {
        // Merge levels and statuses if the title already exists
        const existingItem = existingTitles[existingIndex];
        const updatedLevels = Array.from(new Set([...existingItem.levels, ...formData.jobLevel]));
        const updatedStatuses = Array.from(new Set([...existingItem.statuses, ...formData.desiredEmploymentStatus]));
        existingTitles[existingIndex] = {
          ...existingItem,
          levels: updatedLevels,
          statuses: updatedStatuses,
        };
      } else {
        // Add a new entry if the title does not exist
        existingTitles.push({
          title: jobTitleInput.trim(),
          levels: formData.jobLevel,
          statuses: formData.desiredEmploymentStatus,
        });
      }

      onChange({
        target: {
          name: 'jobTitles',
          value: existingTitles,
        },
      });
      setJobTitleInput(''); // Clear input after adding
    }
  };

  const handleDeleteJobTitle = (title) => {
    const updatedJobTitles = formData.jobTitles.filter((jobTitle) => jobTitle.title !== title);
    onChange({
      target: {
        name: 'jobTitles',
        value: updatedJobTitles,
      },
    });
  };

  return (
    <Section title="Employment Status">
      <RadioGroup
        name="employmentStatus"
        label="Are you currently employed?"
        options={[{ label: 'Yes', value: 'yes' }, { label: 'No', value: 'no' }]}
        value={formData.employmentStatus}
        onChange={onChange}
      />

      <Input
        name="desiredSalary"
        label="Preferred Hourly Rate (/hour)"
        value={formData.desiredSalary}
        onChange={onChange}
      />
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Desired Employment Status</label>
        <Select
          options={employmentStatusOptions}
          isMulti
          placeholder="Select Desired Employment Status"
          onChange={(options) => handleMultiSelectChange(options, 'desiredEmploymentStatus')}
          value={employmentStatusOptions.filter((option) =>
            formData.desiredEmploymentStatus.includes(option.value)
          )}
        />
      </div>
      <div className="mb-4">
        <h3 className="text-gray-700 font-medium mb-2">Location Preferences</h3>
        <Select
          isMulti
          options={locationOptions}
          placeholder="Select preferred locations"
          onChange={handleLocationChange}
          value={locationOptions.filter((option) =>
            formData.locationPreferences.includes(option.value)
          )}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
      <div className="mb-4">
        <h3 className="text-gray-700 font-medium mb-2">Work Type Preferences</h3>
        <Select
          isMulti
          options={workTypeOptions}
          placeholder="Select work types"
          onChange={handleWorkTypeChange}
          value={workTypeOptions.filter((option) =>
            formData.workTypePreferences.includes(option.value)
          )}
          className="react-select-container"
          classNamePrefix="react-select"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Job Level</label>
        <Select
          options={jobLevelOptions}
          isMulti
          placeholder="Select Job Level"
          onChange={(options) => handleMultiSelectChange(options, 'jobLevel')}
          value={jobLevelOptions.filter((option) =>
            formData.jobLevel.includes(option.value)
          )}
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 font-medium mb-2">Desired Job Titles</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={jobTitleInput}
            onChange={(e) => setJobTitleInput(e.target.value)}
            placeholder="Enter a job title"
            className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
          />
          <button
            onClick={handleAddJobTitle}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </div>
        {formData.jobTitles.length > 0 && (
          <ul className="mt-4 space-y-2">
            {formData.jobTitles.map((item, index) => (
              <li
                key={index}
                className="flex justify-between items-center bg-gray-100 border rounded px-3 py-2"
              >
                <span>
                  {item.levels.join('/')} {item.title} ({item.statuses.join(', ')})
                </span>
                <button
                  onClick={() => handleDeleteJobTitle(item.title)}
                  className="text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </Section>
  );
};

const ResumeUpload = ({ formData, previewImages, onFileChange, onOpenModal }) => (
  <Section title="Upload Resume">
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">Resume</label>
      <input
        type="file"
        name="resume"
        accept=".pdf"
        onChange={onFileChange}
        className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
      />
      {formData.resume && (
        <div className="mt-4">
          <p className="text-gray-700">Uploaded: {formData.resume.name}</p>
        </div>
      )}
      {previewImages.length > 0 && (
        <div className="mt-4">
          <h3 className="text-gray-700 font-medium mb-2">Preview:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewImages.map((src, index) => (
              <img
                key={index}
                src={src}
                alt={`Page ${index + 1}`}
                className="border rounded shadow cursor-pointer"
                onClick={() => onOpenModal(src)} // Open modal on click
              />
            ))}
          </div>
        </div>
      )}
    </div>
  </Section>
);
const PricingSection = () => (
  <Section title="Choose a Plan">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <PricingCard title="Basic Plan" price="$50" features={["1 Resume", "Email Support"]} />
      <PricingCard title="Pro Plan" price="$100" features={["3 Resumes", "Priority Support"]} />
      <PricingCard title="Premium Plan" price="$200" features={["Unlimited Resumes", "24/7 Support"]} />
    </div>
  </Section>
);

const PricingCard = ({ title, price, features }) => (
  <div className="bg-gray-100 border rounded-lg p-4 text-center">
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-lg font-semibold text-blue-500 mb-4">{price}</p>
    <ul className="text-sm text-gray-700 mb-4">
      {features.map((feature, index) => (
        <li key={index}>{feature}</li>
      ))}
    </ul>
    <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
      Select
    </button>
  </div>
);

// Reusable Components
const Input = ({ name, label, value, onChange, type = 'text' }) => (
  <div className="mb-4">
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
    />
  </div>
);

const Dropdown = ({ name, label, options, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full border border-gray-300 rounded px-3 py-2 focus:ring focus:ring-blue-500"
    >
      <option value="" disabled>Select an option</option>
      {options.map((option, index) => (
        <option key={index} value={option}>{option}</option>
      ))}
    </select>
  </div>
);

const RadioGroup = ({ name, label, options, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-gray-700 font-medium mb-2">{label}</label>
    <div className="flex gap-4">
      {options.map((option) => (
        <label key={option.value} className="flex items-center">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            className="mr-2"
          />
          {option.label}
        </label>
      ))}
    </div>
  </div>
);

const Section = ({ title, children }) => (
  <div>
    <h2 className="text-xl font-bold mb-4">{title}</h2>
    {children}
  </div>
);

const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
  >
    {children}
  </button>
);

export default App;
