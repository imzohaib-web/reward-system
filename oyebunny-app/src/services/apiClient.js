const getAuthToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('oyebunny_token');
  }
  return null;
};

export const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (netErr) {
    let serviceName = 'Backend Service';
    if (url.includes('5000')) serviceName = 'Auth Service (Port 5000)';
    else if (url.includes('5001')) serviceName = 'Reward Service (Port 5001)';
    else if (url.includes('5002')) serviceName = 'Wallet Service (Port 5002)';

    const explicitError = new Error(
      `Could not connect to ${serviceName} at ${url}. Please verify the microservice is running and MongoDB is connected.`
    );
    explicitError.status = 0;
    explicitError.isNetworkError = true;
    throw explicitError;
  }

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = { status: 'error', message: 'Invalid JSON response received from server' };
  }

  if (!response.ok) {
    const error = new Error(data.message || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};
