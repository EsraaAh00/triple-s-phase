// Grid Migration Utility for MUI v7
// This script helps identify and fix Grid components using the deprecated 'md' prop

export const migrateGridProps = (props) => {
  const { xs, sm, md, lg, xl, ...otherProps } = props;
  
  // In MUI v7, the order should be: xs, sm, lg, xl, md
  // This ensures proper responsive behavior
  return {
    xs,
    sm,
    lg,
    xl,
    md, // md should come after lg in the new format
    ...otherProps
  };
};

// Common Grid patterns that need migration:
export const gridMigrationPatterns = {
  // Old: <Grid item xs={12} md={6} lg={4}>
  // New: <Grid item xs={12} lg={4} md={6}>
  'xs-12-md-6-lg-4': { xs: 12, lg: 4, md: 6 },
  
  // Old: <Grid item xs={12} md={6}>
  // New: <Grid item xs={12} md={6}>
  'xs-12-md-6': { xs: 12, md: 6 },
  
  // Old: <Grid item xs={12} sm={6} md={3}>
  // New: <Grid item xs={12} sm={6} md={3}>
  'xs-12-sm-6-md-3': { xs: 12, sm: 6, md: 3 },
  
  // Old: <Grid item xs={12} md={4}>
  // New: <Grid item xs={12} md={4}>
  'xs-12-md-4': { xs: 12, md: 4 },
  
  // Old: <Grid item xs={12} md={8}>
  // New: <Grid item xs={12} md={8}>
  'xs-12-md-8': { xs: 12, md: 8 },
};

// Helper function to apply migration patterns
export const applyGridMigration = (props, pattern) => {
  if (gridMigrationPatterns[pattern]) {
    return { ...props, ...gridMigrationPatterns[pattern] };
  }
  return props;
};

// Example usage:
// import { migrateGridProps } from './utils/gridMigration';
// 
// // Old way:
// <Grid item xs={12} md={6} lg={4}>
// 
// // New way:
// <Grid item {...migrateGridProps({ xs: 12, md: 6, lg: 4 })}>
// 
// // Or use pattern:
// <Grid item {...applyGridMigration({}, 'xs-12-md-6-lg-4')}>
