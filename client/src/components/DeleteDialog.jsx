import React from "react";
import { motion, AnimatePresence } from "framer-motion";

const DeleteDialog = ({ isOpen, onConfirm, onCancel, title = "Delete Item?", message = "Are you sure you want to delete this item? This action cannot be undone." }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Elegant Backdrop with light blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        onClick={onCancel}
                    ></motion.div>

                    {/* Minimalist Dialog Box */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 400 }}
                        className="relative bg-white rounded-2xl shadow-xl w-full max-w-[340px] overflow-hidden p-8 text-center"
                    >
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-gray-900">
                                    {title}
                                </h3>
                                <p className="text-gray-500 text-sm leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 text-gray-500 hover:text-gray-700 font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98] border border-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={onConfirm}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all duration-200 cursor-pointer active:scale-[0.98] shadow-md shadow-red-100"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DeleteDialog;
