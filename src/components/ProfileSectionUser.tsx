'use client';

import React, { useState } from 'react';

const ProfileSectionUser: React.FC = () => {
  const [form, setForm] = useState({
    fullname: '',
    username: '',
    email: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    console.log('Saved profile:', form);
    // Add API call or localStorage logic here
  };

  return (
    <section className="max-w-4xl mx-auto p-6 rounded-xl">
      <div className="flex flex-col gap-6">
        <input
          name="fullname"
          placeholder="Full Name"
          value={form.fullname}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-lg bg-gray-100 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <button
          onClick={handleSave}
          className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
      </div>
    </section>
  );
};

export default ProfileSectionUser;
