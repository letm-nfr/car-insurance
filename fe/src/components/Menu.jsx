import { IoClose } from 'react-icons/io5'
import { MdPolicy, MdNotifications } from 'react-icons/md'

export default function Menu({ isOpen, onClose, onMenuItemClick }) {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Menu Drawer */}
      <div
        className={`fixed left-0 top-0 h-screen w-64 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Menu Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 className="text-[#0d141b] dark:text-white font-bold text-lg">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <IoClose size={24} className="text-[#0d141b] dark:text-white" />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {/* My Policies */}
          <button
            onClick={() => {
              onMenuItemClick('policies')
              onClose()
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <MdPolicy size={24} className="text-primary" />
            <div>
              <p className="text-[#0d141b] dark:text-white font-semibold">
                My Policies
              </p>
              <p className="text-xs text-[#4c739a] dark:text-gray-400">
                View your insurance policies
              </p>
            </div>
          </button>

          {/* Notifications */}
          <button
            onClick={() => {
              onMenuItemClick('notifications')
              onClose()
            }}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
          >
            <MdNotifications size={24} className="text-primary" />
            <div>
              <p className="text-[#0d141b] dark:text-white font-semibold">
                Notifications
              </p>
              <p className="text-xs text-[#4c739a] dark:text-gray-400">
                Check your updates
              </p>
            </div>
          </button>

          {/* Divider */}
          <div className="my-4 border-t border-gray-200 dark:border-gray-800" />

          {/* Help Section */}
          <div className="p-3 space-y-2">
            <p className="text-xs text-[#4c739a] dark:text-gray-400 font-semibold uppercase">
              Support
            </p>
            <a
              href="#"
              className="block text-sm text-primary hover:text-primary/80"
            >
              Help Center
            </a>
            <a
              href="#"
              className="block text-sm text-primary hover:text-primary/80"
            >
              Contact Us
            </a>
            <a
              href="#"
              className="block text-sm text-primary hover:text-primary/80"
            >
              FAQ
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800">
          <p className="text-xs text-[#4c739a] dark:text-gray-400">
            InsuracePro © 2026
          </p>
        </div>
      </div>
    </>
  )
}
