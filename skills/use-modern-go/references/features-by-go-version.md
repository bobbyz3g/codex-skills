# Features By Go Version

Apply entries up to the target Go version. Do not use entries from newer versions.

## Go 1.0+

- `time.Since(start)` instead of `time.Now().Sub(start)`

## Go 1.8+

- `time.Until(deadline)` instead of `deadline.Sub(time.Now())`

## Go 1.13+

- `errors.Is(err, target)` instead of direct equality checks when wrapping may be involved

## Go 1.18+

- Use `any` instead of `interface{}`
- `bytes.Cut`
- `strings.Cut`

## Go 1.19+

- `fmt.Appendf` instead of `[]byte(fmt.Sprintf(...))`
- Type-safe atomics such as `atomic.Bool`, `atomic.Int64`, and `atomic.Pointer[T]`

```go
var flag atomic.Bool
flag.Store(true)
if flag.Load() {
    // ...
}

var ptr atomic.Pointer[Config]
ptr.Store(cfg)
```

## Go 1.20+

- `strings.Clone`
- `bytes.Clone`
- `strings.CutPrefix`
- `strings.CutSuffix`
- `errors.Join`
- `context.WithCancelCause`
- `context.Cause`

## Go 1.21+

Built-ins:

- `min`
- `max`
- `clear`

`slices` package:

- `slices.Contains`
- `slices.Index`
- `slices.IndexFunc`
- `slices.Sort`
- `slices.SortFunc`
- `slices.Max`
- `slices.Min`
- `slices.Reverse`
- `slices.Compact`
- `slices.Clip`
- `slices.Clone`

`maps` package:

- `maps.Clone`
- `maps.Copy`
- `maps.DeleteFunc`

`sync` package:

- `sync.OnceFunc`
- `sync.OnceValue`

`context` package:

- `context.AfterFunc`
- `context.WithTimeoutCause`
- `context.WithDeadlineCause`

## Go 1.22+

Loops:

- `for i := range n` instead of index-style `for i := 0; i < n; i++`
- Loop variables are safe to capture in closures and goroutines

Other additions:

- `cmp.Or`
- `reflect.TypeFor`
- HTTP method-aware `http.ServeMux` patterns and `r.PathValue(...)`

```go
name := cmp.Or(os.Getenv("NAME"), "default")
```

## Go 1.23+

- `maps.Keys(m)` and `maps.Values(m)` iterators
- `slices.Collect(iter)`
- `slices.Sorted(iter)`
- `time.Tick` is acceptable when it matches the use case

```go
keys := slices.Collect(maps.Keys(m))
sortedKeys := slices.Sorted(maps.Keys(m))
for k := range maps.Keys(m) {
    process(k)
}
```

## Go 1.24+

Tests:

- Prefer `t.Context()` when a test needs a context

JSON:

- Prefer `omitzero` over `omitempty` for fields such as `time.Duration`, `time.Time`, structs, slices, and maps when zero-value omission is intended

Benchmarks:

- Prefer `b.Loop()` over `for i := 0; i < b.N; i++`

Iteration helpers:

- Prefer `strings.SplitSeq` and `strings.FieldsSeq` when iterating
- Prefer `bytes.SplitSeq` and `bytes.FieldsSeq` when iterating

```go
for part := range strings.SplitSeq(s, ",") {
    process(part)
}
```

## Go 1.25+

- Prefer `wg.Go(fn)` over `wg.Add(1)` plus `go func() { defer wg.Done() }()`

```go
var wg sync.WaitGroup
for _, item := range items {
    item := item
    wg.Go(func() {
        process(item)
    })
}
wg.Wait()
```

## Go 1.26+

- Prefer `new(value)` over creating a temporary variable and taking its address
- Prefer `errors.AsType[T](err)` over `errors.As(err, &target)`

```go
cfg := Config{
    Timeout: new(30),
    Debug:   new(true),
}

if pathErr, ok := errors.AsType[*os.PathError](err); ok {
    handle(pathErr)
}
```
