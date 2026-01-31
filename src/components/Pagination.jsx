import React from 'react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  showInfo = true 
}) => {
  const { t, i18n } = useTranslation("global");
  const isRTL = i18n.language === "ar";

  // Calculate visible page numbers
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Show pagination even if there's only one page to display info
  // if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container" dir={isRTL ? "rtl" : "ltr"}>
      {showInfo && (
        <div className="pagination-info mb-3">
          <small className="text-muted">
            {isRTL ? (
              <>عرض {startItem} إلى {endItem} من {totalItems} طلب</>
            ) : (
              <>Showing {startItem} to {endItem} of {totalItems} orders</>
            )}
          </small>
        </div>
      )}
      
      {totalPages > 1 && (
        <nav aria-label="Pagination Navigation">
          <ul className="pagination justify-content-center mb-0">
          {/* Previous Button */}
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label={isRTL ? "الصفحة السابقة" : "Previous page"}
            >
              <i className={`bi bi-chevron-${isRTL ? 'right' : 'left'}`}></i>
            </button>
          </li>

          {/* Page Numbers */}
          {visiblePages.map((page, index) => (
            <li key={index} className={`page-item ${page === currentPage ? 'active' : ''} ${page === '...' ? 'disabled' : ''}`}>
              {page === '...' ? (
                <span className="page-link">...</span>
              ) : (
                <button
                  className="page-link"
                  onClick={() => onPageChange(page)}
                  aria-label={`${isRTL ? 'الصفحة' : 'Page'} ${page}`}
                  aria-current={page === currentPage ? 'page' : undefined}
                >
                  {page}
                </button>
              )}
            </li>
          ))}

          {/* Next Button */}
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label={isRTL ? "الصفحة التالية" : "Next page"}
            >
              <i className={`bi bi-chevron-${isRTL ? 'left' : 'right'}`}></i>
            </button>
          </li>
        </ul>
        </nav>
      )}
    </div>
  );
};

export default Pagination;
