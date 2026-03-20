import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, X } from "lucide-react";

const LogoutDialog = ({ isOpen, onConfirm, onCancel }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onCancel}
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center"
          >
            {/* Close button */}
            <button
              onClick={onCancel}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={22} />
            </button>

            {/* Icon */}
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <LogOut className="w-7 h-7 text-red-500" />
            </div>

            {/* Text */}
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1">
              Log Out?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to log out of your{" "}
              <span className="font-bold text-indigo-600">NativeNest</span>{" "}
              account?
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all text-sm active:scale-[0.98]"
              >
                Go Back
              </button>
              <button
                onClick={onConfirm}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] text-sm"
              >
                Log Out
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LogoutDialog;