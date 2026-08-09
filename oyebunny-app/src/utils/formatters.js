export const formatCurrency = (amount) => {
  return `Rs. ${Number(amount || 0).toLocaleString('en-PK')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
